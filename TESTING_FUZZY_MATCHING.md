# Testing Fuzzy Location Matching

This guide demonstrates how to test the fuzzy matching feature that handles misspelled location names.

## Overview

The location service now uses **Levenshtein distance** algorithm to match misspelled location names with 70% similarity threshold. This means users can make typos and still get correct results!

## Test Cases

### Test 1: Correct Spelling (Baseline)

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 1",
    "description": "Correct spelling",
    "location": "Erawan Shrine",
    "category": "spiritual"
  }'
```

**Expected**: Success with coordinates `lat: 13.7447, lng: 100.5396`

**Log**: `Found coordinates for "Erawan Shrine" -> Erawan Shrine`

---

### Test 2: Missing Letter

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 2",
    "description": "Missing letter r",
    "location": "Erwan Shrine",
    "category": "spiritual"
  }'
```

**Expected**: Success with same coordinates (fuzzy matched)

**Log**: `Fuzzy matched "Erwan Shrine" to "Erawan Shrine" (possible misspelling corrected)`

---

### Test 3: Swapped Letters

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 3",
    "description": "Transposed letters",
    "location": "Erawna Shrine",
    "category": "spiritual"
  }'
```

**Expected**: Success (fuzzy matched)

**Log**: `Fuzzy matched "Erawna Shrine" to "Erawan Shrine"`

---

### Test 4: Extra Letter

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 4",
    "description": "Extra letter t",
    "location": "Watt Arun",
    "category": "spiritual"
  }'
```

**Expected**: Success, matched to "Wat Arun"

---

### Test 5: Wrong Vowel

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 5",
    "description": "Wrong vowel a->e",
    "location": "Wet Arun",
    "category": "spiritual"
  }'
```

**Expected**: Success, matched to "Wat Arun"

---

### Test 6: Multiple Typos

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 6",
    "description": "Multiple typos",
    "location": "Wat Pra Kaaw",
    "category": "spiritual"
  }'
```

**Expected**: Success, matched to "Wat Phra Kaew"

---

### Test 7: Common Misspelling

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 7",
    "description": "Common misspelling of Buddha",
    "location": "Big Budha",
    "category": "spiritual"
  }'
```

**Expected**: Success, matched to "Big Buddha"

---

### Test 8: Wrong Ending

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 8",
    "description": "Wrong ending",
    "location": "Doi Suthap",
    "category": "spiritual"
  }'
```

**Expected**: Success, matched to "Wat Phra That Doi Suthep" or "Doi Suthep"

---

### Test 9: Phonetic Spelling

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 9",
    "description": "Phonetic spelling",
    "location": "Chatujak",
    "category": "spiritual"
  }'
```

**Expected**: Success, matched to "Chatuchak"

---

### Test 10: Too Many Errors (Should Fail)

```powershell
curl -X POST http://localhost:3000/shrines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test 10",
    "description": "Too many errors",
    "location": "Xyz Random Place",
    "category": "spiritual"
  }'
```

**Expected**: Error - Not found (similarity < 70%)

**Log**: `No coordinates found for address: Xyz Random Place`

---

### Test 11: Distance with Misspellings

Test the distance calculation endpoint with misspelled locations:

```powershell
curl -X POST http://localhost:3000/location/distance `
  -H "Content-Type: application/json" `
  -d '{
    "origin": "Erwan Shrine",
    "destination": "Wat Pra Kaew"
  }'
```

**Expected**: Success with distance calculation

**Log**:

```
Fuzzy matched origin "Erwan Shrine" to "Erawan Shrine"
Fuzzy matched destination "Wat Pra Kaew" to "Wat Phra Kaew"
Distance calculated: Erawan Shrine -> Wat Phra Kaew = 1.2 km
```

---

## Testing Similarity Threshold

The current threshold is **70% similarity**. Here's how different error levels perform:

| Input           | Actual Location | Similarity | Result      |
| --------------- | --------------- | ---------- | ----------- |
| "Erawan Shrine" | Erawan Shrine   | 100%       | ✅ Match    |
| "Erwan Shrine"  | Erawan Shrine   | ~92%       | ✅ Match    |
| "Erwn Shrine"   | Erawan Shrine   | ~85%       | ✅ Match    |
| "Erw Shrine"    | Erawan Shrine   | ~78%       | ✅ Match    |
| "Er Shrine"     | Erawan Shrine   | ~71%       | ✅ Match    |
| "E Shrine"      | Erawan Shrine   | ~64%       | ❌ No Match |

## Adjusting the Threshold

To change the similarity threshold, edit `mock-location.database.ts`:

```typescript
const FUZZY_MATCH_THRESHOLD = 0.7; // Change this value (0.0 to 1.0)
```

**Recommendations**:

- **0.8 (80%)**: Stricter, fewer false positives
- **0.7 (70%)**: Balanced (current setting)
- **0.6 (60%)**: More lenient, handles worse typos

## Performance Test

Test fuzzy matching performance with multiple requests:

```powershell
# Run 10 requests with misspellings
1..10 | ForEach-Object {
    curl -X POST http://localhost:3000/shrines `
      -H "Content-Type: application/json" `
      -d "{
        \`"name\`": \`"Perf Test $_\`",
        \`"description\`": \`"Performance test\`",
        \`"location\`": \`"Erwan Shrine\`",
        \`"category\`": \`"spiritual\`"
      }"
    Start-Sleep -Milliseconds 100
}
```

**Expected**: All requests succeed with consistent response times

## Debugging

To see fuzzy matching in action, watch the service logs:

```powershell
# If running with pnpm start:all
# Logs will show in the terminal

# If running in Docker
docker logs location-service -f

# If running in Kubernetes
kubectl logs -n microservices -l app=location-service -f
```

**Look for these log messages**:

```
[LocationService] Fuzzy matched "Erwan Shrine" to "Erawan Shrine" (possible misspelling corrected)
[LocationService] Found coordinates for "Erwan Shrine" -> Erawan Shrine: lat: 13.7447, lng: 100.5396
```

## Success Criteria

✅ Exact matches still work  
✅ Single character typos are handled  
✅ Transposed letters are handled  
✅ Extra/missing letters are handled  
✅ Multiple typos (within threshold) are handled  
✅ Completely wrong inputs are rejected  
✅ Logs show when fuzzy matching is used  
✅ Performance remains fast

## Common Thai Location Misspellings to Test

| Common Misspelling | Correct Name       |
| ------------------ | ------------------ |
| "Erwan"            | Erawan             |
| "Wat Pra"          | Wat Phra           |
| "Doi Suthap"       | Doi Suthep         |
| "Chatujak"         | Chatuchak          |
| "Budha"            | Buddha             |
| "Sukumvit"         | Sukhumvit          |
| "Pattaya"          | Pattaya (if added) |
| "Chedi Lung"       | Chedi Luang        |

## Edge Cases

Test these edge cases:

1. **Empty string**: Should fail validation
2. **Single character**: Should not match anything
3. **All numbers**: Should not match
4. **Special characters**: "Wat@Arun" → should match "Wat Arun"
5. **Extra spaces**: "Wat Arun" → should match "Wat Arun"
6. **Case variations**: "WAT ARUN" → should match "Wat Arun"

## Troubleshooting

### Issue: Too many false positives

**Solution**: Increase threshold to 0.8 or 0.85

### Issue: Valid misspellings not matching

**Solution**: Decrease threshold to 0.6 or 0.65

### Issue: Slow performance

**Solution**: Fuzzy matching only runs if exact/partial matches fail, so this should be rare. If needed, cache results or optimize the Levenshtein distance calculation.
