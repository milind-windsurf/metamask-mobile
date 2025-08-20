# Docker Image Validation Tool

A comprehensive Docker image validation system for multiple repositories, providing security scanning, Dockerfile linting, and best practices enforcement.

## Supported Repositories

This tool is designed to validate Docker images and Dockerfiles across the following repositories:

- `bp/business-growth`
- `bp/rag-pipelines`
- `bpia/bpia-aws-darknet`
- `bpia/bpia-yolov5`
- `cama/cama-smartcomms`
- `caspian/datahub-ingestion`
- `caspian/genchi-data-drift`
- `caspian/hubble-lineage-calculation`
- `caspian/hubble-pagerank-calculation`
- `caspian/poseidon-spark3-curated`

## Features

### 🔍 Dockerfile Linting
- Uses [hadolint](https://github.com/hadolint/hadolint) for Dockerfile best practices
- Configurable rules and severity levels
- Checks for common security issues and inefficiencies

### 🛡️ Security Scanning
- Uses [Trivy](https://github.com/aquasecurity/trivy) for vulnerability scanning
- Scans for known CVEs in base images and dependencies
- Configurable severity thresholds

### 📊 Image Analysis
- Uses [dive](https://github.com/wagoodman/dive) for layer analysis
- Identifies inefficient layers and wasted space
- Size and layer count validation

### ✅ Best Practices Enforcement
- Non-root user requirements
- Health check validation
- Label requirements
- Tag policies (no latest tags)

## Installation

### Prerequisites

The validation tools are automatically installed when you run the setup:

```bash
# Install hadolint
curl -L https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64 -o /tmp/hadolint
chmod +x /tmp/hadolint
sudo mv /tmp/hadolint /usr/local/bin/hadolint

# Install trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sudo sh -s -- -b /usr/local/bin

# Install dive
curl -L https://github.com/wagoodman/dive/releases/download/v0.12.0/dive_0.12.0_linux_amd64.tar.gz -o /tmp/dive.tar.gz
tar -xzf /tmp/dive.tar.gz -C /tmp
sudo mv /tmp/dive /usr/local/bin/dive
rm /tmp/dive.tar.gz
```

### Python Dependencies

```bash
pip install pyyaml
```

## Usage

### Validate All Repositories

```bash
./validate-all.sh
```

This script will:
1. Check for all supported repositories in `~/repos/`
2. Run validation on found repositories
3. Generate a comprehensive report

### Validate Specific Repositories

```bash
python3 docker-image-validator.py --repos /path/to/repo1 /path/to/repo2 --config config.yaml
```

### Generate JSON Report

```bash
python3 docker-image-validator.py --repos /path/to/repo --format json --output report.json
```

## Configuration

The validation behavior can be customized using the `config.yaml` file:

```yaml
dockerfile_linting:
  enabled: true
  rules:
    - DL3000  # Use absolute WORKDIR
    - DL3002  # Last USER should not be root
    - DL3006  # Always tag the version of an image explicitly

security_scanning:
  enabled: true
  severity_threshold: "HIGH"  # UNKNOWN, LOW, MEDIUM, HIGH, CRITICAL
  ignore_unfixed: false

image_analysis:
  enabled: true
  max_layers: 50
  max_size_mb: 2048

best_practices:
  require_non_root_user: true
  require_health_check: false
  require_labels: true
  disallow_latest_tag: true
```

### Repository-Specific Configuration

You can override global settings for specific repositories:

```yaml
repositories:
  "bpia/bpia-aws-darknet":
    security_scanning:
      severity_threshold: "CRITICAL"
  
  "caspian/genchi-data-drift":
    security_scanning:
      severity_threshold: "MEDIUM"
```

## Validation Rules

### Dockerfile Linting Rules

| Rule | Description |
|------|-------------|
| DL3000 | Use absolute WORKDIR |
| DL3001 | Avoid running commands that don't make sense in containers |
| DL3002 | Last USER should not be root |
| DL3003 | Use WORKDIR to switch to a directory |
| DL3004 | Do not use sudo |
| DL3006 | Always tag the version of an image explicitly |
| DL3007 | Using latest is prone to errors |
| DL3008 | Pin versions in apt get install |
| DL3009 | Delete the apt-get lists after installing |
| DL3010 | Use ADD for extracting archives |

### Security Scanning

- **CRITICAL**: Vulnerabilities with CVSS score 9.0-10.0
- **HIGH**: Vulnerabilities with CVSS score 7.0-8.9
- **MEDIUM**: Vulnerabilities with CVSS score 4.0-6.9
- **LOW**: Vulnerabilities with CVSS score 0.1-3.9

### Best Practices

- **Non-root user**: Containers should not run as root
- **Health checks**: Services should define health check endpoints
- **Labels**: Images should include metadata labels
- **Tag policies**: Avoid using `latest` tags in production

## Output

The tool generates detailed reports in both text and JSON formats:

### Text Report Example

```markdown
# Docker Image Validation Report

## Summary
- Total repositories validated: 5
- Repositories passed: 3
- Repositories failed: 2

## Repository: business-growth
**Status:** ✅ PASSED
**Path:** /home/user/repos/business-growth

### Dockerfile Validation
- /home/user/repos/business-growth/Dockerfile: ✅ PASSED

### Image Validation
- trivy scan of business-growth:latest: ✅ PASSED
```

### JSON Report Example

```json
{
  "repository": "business-growth",
  "path": "/home/user/repos/business-growth",
  "dockerfiles": [
    {
      "tool": "hadolint",
      "dockerfile": "/home/user/repos/business-growth/Dockerfile",
      "issues": [],
      "passed": true
    }
  ],
  "images": [
    {
      "tool": "trivy",
      "image": "business-growth:latest",
      "scan_result": {},
      "passed": true
    }
  ],
  "overall_passed": true
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Docker Image Validation

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate-docker:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup validation tools
      run: |
        # Install hadolint, trivy, dive
        curl -L https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64 -o hadolint
        chmod +x hadolint
        sudo mv hadolint /usr/local/bin/
        
    - name: Run Docker validation
      run: |
        python3 docker-image-validator.py --repos . --config config.yaml
```

## Troubleshooting

### Common Issues

1. **Tool not found**: Ensure hadolint, trivy, and dive are installed and in PATH
2. **Permission denied**: Make sure scripts have execute permissions (`chmod +x validate-all.sh`)
3. **Repository not found**: Check that repositories exist in the expected locations
4. **Image not found**: Ensure Docker images are built locally before scanning

### Debug Mode

Run with verbose output:

```bash
python3 docker-image-validator.py --repos /path/to/repo --config config.yaml --verbose
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
