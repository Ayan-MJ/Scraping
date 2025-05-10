# CI/CD Setup for Backend

This document describes how to set up and run the CI/CD pipeline for the backend service.

## Local Development Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. Install development dependencies:
   ```bash
   pip install pytest pytest-cov flake8
   ```

3. Run tests:
   ```bash
   cd tests
   python -c "import test_health; test_health.test_health()"
   ```

## GitHub Actions Workflow

The CI pipeline is configured in `.github/workflows/ci.yml` and includes:

1. Setting up Python 3.10
2. Installing dependencies
3. Linting with flake8
4. Running health check tests
5. Services:
   - Redis for caching and message queue
   - PostgreSQL for database

## Troubleshooting

### Dependency Issues

The project has dependencies that may cause conflicts with newer Python versions (>= 3.11):
- asyncpg: C extensions compatibility issues
- greenlet: C extensions compatibility issues
- ormar: Version constraints with SQLAlchemy and pydantic

For CI/CD purposes, we use a simplified test approach that doesn't require installing all dependencies.

### Mock Dependencies

For testing without installing problematic dependencies, we use mock modules in `tests/conftest.py`:

```python
import sys
from unittest.mock import MagicMock

# Mock modules that are causing compatibility issues
MOCK_MODULES = [
    'asyncpg',
    'greenlet',
    'ormar',
    'aioredis',
    'supabase',
    'croniter',
]

for mod_name in MOCK_MODULES:
    sys.modules[mod_name] = MagicMock()
```

## Adding New Tests

When adding new tests:

1. Create a new test file in the `tests/` directory
2. Import necessary mocks from `conftest.py`
3. Write tests that can run independently of external services
4. Update the GitHub workflow if needed 