#!/bin/bash


set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATOR_SCRIPT="$SCRIPT_DIR/docker-image-validator.py"
CONFIG_FILE="$SCRIPT_DIR/config.yaml"

REPOS=(
    "bp/business-growth"
    "bp/rag-pipelines"
    "bpia/bpia-aws-darknet"
    "bpia/bpia-yolov5"
    "cama/cama-smartcomms"
    "caspian/datahub-ingestion"
    "caspian/genchi-data-drift"
    "caspian/hubble-lineage-calculation"
    "caspian/hubble-pagerank-calculation"
    "caspian/poseidon-spark3-curated"
)

REPO_BASE_PATH="${REPO_BASE_PATH:-$HOME/repos}"

echo "🐳 Docker Image Validation Tool"
echo "================================"
echo ""

echo "Checking validation tools..."
if ! command -v hadolint &> /dev/null; then
    echo "❌ hadolint is not installed"
    exit 1
fi

if ! command -v trivy &> /dev/null; then
    echo "❌ trivy is not installed"
    exit 1
fi

if ! command -v dive &> /dev/null; then
    echo "❌ dive is not installed"
    exit 1
fi

echo "✅ All validation tools are installed"
echo ""

EXISTING_REPOS=()
MISSING_REPOS=()

for repo in "${REPOS[@]}"; do
    repo_name=$(basename "$repo")
    repo_path="$REPO_BASE_PATH/$repo_name"
    
    if [ -d "$repo_path" ]; then
        EXISTING_REPOS+=("$repo_path")
        echo "✅ Found: $repo -> $repo_path"
    else
        MISSING_REPOS+=("$repo")
        echo "❌ Missing: $repo (expected at $repo_path)"
    fi
done

echo ""

if [ ${#EXISTING_REPOS[@]} -eq 0 ]; then
    echo "❌ No repositories found to validate"
    echo ""
    echo "Expected repositories at:"
    for repo in "${REPOS[@]}"; do
        repo_name=$(basename "$repo")
        echo "  - $REPO_BASE_PATH/$repo_name"
    done
    exit 1
fi

echo "📋 Validation Summary:"
echo "  - Found repositories: ${#EXISTING_REPOS[@]}"
echo "  - Missing repositories: ${#MISSING_REPOS[@]}"
echo ""

echo "🔍 Starting validation..."
echo ""

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$SCRIPT_DIR/validation_report_$TIMESTAMP.md"

python3 "$VALIDATOR_SCRIPT" \
    --repos "${EXISTING_REPOS[@]}" \
    --config "$CONFIG_FILE" \
    --output "$REPORT_FILE" \
    --format text

echo ""
echo "📊 Validation completed!"
echo "📄 Report saved to: $REPORT_FILE"

if [ ${#MISSING_REPOS[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Missing repositories:"
    for repo in "${MISSING_REPOS[@]}"; do
        echo "  - $repo"
    done
fi
