#!/bin/bash

VUS=10000
rc1=0 # Initialize exit code variables
rc2=0

# --- Test 1: Standard Load Test ---
echo "Starting Test 1: Standard Load Test (k6-load-test.js)..."
k6 run /scripts/k6-load-test.js \
  --env VUS=$VUS \
  --env LOAD_TEST_DURATION=2m \
  --tag test_name=load_test \
  --tag profile=medium
rc1=$? # Capture the exit code of Test 1

# If Test 1 failed, we want to proceed to Test 2 but remember the failure.
if [[ $rc1 -ne 0 ]]; then
    echo "⚠️ WARNING: Test 1 failed (Exit Code: $rc1). Continuing to Test 2..."
    # Turn off 'set -e' temporarily so Test 2's failure doesn't halt the script immediately
    set +e
fi

echo "Test 1 completed."

echo "Waiting 2 minutes before starting next time ..."
sleep 120

# --- Test 2: High-Volume Stress Test ---
echo "Starting Test 2: High-Volume Stress Test (k6-stress-test.js)..."
k6 run /scripts/k6-stress-test.js \
  --env VUS=$VUS \
  --env STRESS_TEST_RAMP_UP_MINUTES=5 \
  --env STRESS_TEST_SUSTAIN_MINUTES=5 \
  --tag test_name=stress_test \
  --tag profile=high
rc2=$? # Capture the exit code of Test 2

echo "Test 2 completed."

# Re-enable 'set -e' if it was disabled (optional, but good practice before final exit logic)
set -e

# --- Final Exit Check ---
echo "All sequential tests finished!"

# Exit 0 only if both rc1 and rc2 are 0 (success).
if [[ $rc1 -ne 0 || $rc2 -ne 0 ]]; then
    echo "❌ One or more tests failed! (Test 1 RC: $rc1, Test 2 RC: $rc2)"
    exit 1
else
    echo "✅ Both tests completed successfully."
    exit 0
fi