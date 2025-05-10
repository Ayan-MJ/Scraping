from setuptools import setup, find_packages

setup(
    name="scraping-wizard-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.95.0,<0.96.0",
        "uvicorn>=0.23.2,<0.24.0",
        "pydantic>=1.8.1,<1.11.0",
        "python-dotenv>=0.21.0,<0.22.0",
    ],
    extras_require={
        "test": [
            "pytest>=7.4.2",
            "pytest-cov>=4.1.0",
        ],
    },
) 