# Metro Development Environment
# Python-only development environment as required by AGENTS.md

FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    libfreetype6-dev \
    libpng-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy project files
COPY . /workspace/

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install -e ".[dev,test]"

# Set environment variables
ENV PYTHONPATH=/workspace
ENV PYTHONUNBUFFERED=1

# Default command
CMD ["/bin/bash"]
