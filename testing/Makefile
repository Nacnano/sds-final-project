docker-compose:
	docker-compose up --scale k6-runner=1 -d

load-test:
	k6 run --vus 1000 --duration 1m ./scripts/k6-load-test.js