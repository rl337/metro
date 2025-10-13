# Metro Development Environment
# Python-only development environment as required by AGENTS.md

FROM python:3.12-slim

# Install system dependencies including Node.js
RUN apt-get update && \
    apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    libfreetype6-dev \
    libpng-dev \
    pkg-config \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy project files
COPY . /workspace/

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install -e ".[dev,test]"

# Install Node.js dependencies and Playwright
RUN npm install
RUN npx playwright install --with-deps

# Set environment variables
ENV PYTHONPATH=/workspace
ENV PYTHONUNBUFFERED=1

# Default command
CMD ["/bin/bash"]
