#!/usr/bin/env python3
"""
Docker Image Validation Tool

This tool validates Docker images and Dockerfiles for security, best practices,
and compliance across multiple repositories.

Supported repositories:
- bp/business-growth
- bp/rag-pipelines  
- bpia/bpia-aws-darknet
- bpia/bpia-yolov5
- cama/cama-smartcomms
- caspian/datahub-ingestion
- caspian/genchi-data-drift
- caspian/hubble-lineage-calculation
- caspian/hubble-pagerank-calculation
- caspian/poseidon-spark3-curated
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import yaml

class DockerImageValidator:
    def __init__(self, config_path: Optional[str] = None):
        self.config = self.load_config(config_path)
        self.supported_repos = [
            "bp/business-growth",
            "bp/rag-pipelines", 
            "bpia/bpia-aws-darknet",
            "bpia/bpia-yolov5",
            "cama/cama-smartcomms",
            "caspian/datahub-ingestion",
            "caspian/genchi-data-drift",
            "caspian/hubble-lineage-calculation",
            "caspian/hubble-pagerank-calculation",
            "caspian/poseidon-spark3-curated"
        ]
        
    def load_config(self, config_path: Optional[str]) -> Dict:
        """Load validation configuration"""
        default_config = {
            "dockerfile_linting": {
                "enabled": True,
                "rules": ["DL3000", "DL3001", "DL3002", "DL3003", "DL3004", "DL3006", "DL3007", "DL3008", "DL3009", "DL3010"]
            },
            "security_scanning": {
                "enabled": True,
                "severity_threshold": "HIGH",
                "ignore_unfixed": False
            },
            "image_analysis": {
                "enabled": True,
                "max_layers": 50,
                "max_size_mb": 2048
            },
            "best_practices": {
                "require_non_root_user": True,
                "require_health_check": False,
                "require_labels": True,
                "disallow_latest_tag": True
            }
        }
        
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                user_config = yaml.safe_load(f)
                default_config.update(user_config)
                
        return default_config
    
    def find_dockerfiles(self, repo_path: str) -> List[str]:
        """Find all Dockerfiles in a repository"""
        dockerfiles = []
        repo_path = Path(repo_path)
        
        patterns = ["Dockerfile", "Dockerfile.*", "*.dockerfile", "docker/Dockerfile"]
        
        for pattern in patterns:
            dockerfiles.extend(repo_path.rglob(pattern))
            
        return [str(df) for df in dockerfiles if df.is_file()]
    
    def validate_dockerfile_with_hadolint(self, dockerfile_path: str) -> Dict:
        """Validate Dockerfile using hadolint"""
        try:
            result = subprocess.run(
                ["hadolint", "--format", "json", dockerfile_path],
                capture_output=True,
                text=True
            )
            
            if result.stdout:
                issues = json.loads(result.stdout)
            else:
                issues = []
                
            return {
                "tool": "hadolint",
                "dockerfile": dockerfile_path,
                "issues": issues,
                "passed": len(issues) == 0
            }
        except Exception as e:
            return {
                "tool": "hadolint", 
                "dockerfile": dockerfile_path,
                "error": str(e),
                "passed": False
            }
    
    def scan_image_with_trivy(self, image_name: str) -> Dict:
        """Scan Docker image for vulnerabilities using Trivy"""
        try:
            result = subprocess.run([
                "trivy", "image", "--format", "json", 
                "--severity", self.config["security_scanning"]["severity_threshold"],
                image_name
            ], capture_output=True, text=True)
            
            if result.stdout:
                scan_result = json.loads(result.stdout)
            else:
                scan_result = {}
                
            return {
                "tool": "trivy",
                "image": image_name,
                "scan_result": scan_result,
                "passed": len(scan_result.get("Results", [])) == 0
            }
        except Exception as e:
            return {
                "tool": "trivy",
                "image": image_name, 
                "error": str(e),
                "passed": False
            }
    
    def analyze_image_with_dive(self, image_name: str) -> Dict:
        """Analyze Docker image layers using dive"""
        try:
            result = subprocess.run([
                "dive", "--ci", image_name
            ], capture_output=True, text=True)
            
            return {
                "tool": "dive",
                "image": image_name,
                "efficiency_score": "N/A",
                "passed": result.returncode == 0,
                "output": result.stdout
            }
        except Exception as e:
            return {
                "tool": "dive",
                "image": image_name,
                "error": str(e), 
                "passed": False
            }
    
    def validate_repository(self, repo_path: str, repo_name: str) -> Dict:
        """Validate all Docker assets in a repository"""
        validation_results = {
            "repository": repo_name,
            "path": repo_path,
            "dockerfiles": [],
            "images": [],
            "overall_passed": True
        }
        
        dockerfiles = self.find_dockerfiles(repo_path)
        
        for dockerfile in dockerfiles:
            if self.config["dockerfile_linting"]["enabled"]:
                result = self.validate_dockerfile_with_hadolint(dockerfile)
                validation_results["dockerfiles"].append(result)
                if not result["passed"]:
                    validation_results["overall_passed"] = False
        
        compose_files = list(Path(repo_path).rglob("docker-compose*.yml")) + \
                      list(Path(repo_path).rglob("docker-compose*.yaml"))
        
        image_names = set()
        for compose_file in compose_files:
            try:
                with open(compose_file, 'r') as f:
                    compose_data = yaml.safe_load(f)
                    services = compose_data.get("services", {})
                    for service_name, service_config in services.items():
                        if "image" in service_config:
                            image_names.add(service_config["image"])
            except Exception as e:
                print(f"Warning: Could not parse {compose_file}: {e}")
        
        for image_name in image_names:
            if self.config["security_scanning"]["enabled"]:
                result = self.scan_image_with_trivy(image_name)
                validation_results["images"].append(result)
                if not result["passed"]:
                    validation_results["overall_passed"] = False
                    
            if self.config["image_analysis"]["enabled"]:
                result = self.analyze_image_with_dive(image_name)
                validation_results["images"].append(result)
                if not result["passed"]:
                    validation_results["overall_passed"] = False
        
        return validation_results
    
    def generate_report(self, results: List[Dict]) -> str:
        """Generate a validation report"""
        report = ["# Docker Image Validation Report\n"]
        
        total_repos = len(results)
        passed_repos = sum(1 for r in results if r["overall_passed"])
        
        report.append(f"## Summary")
        report.append(f"- Total repositories validated: {total_repos}")
        report.append(f"- Repositories passed: {passed_repos}")
        report.append(f"- Repositories failed: {total_repos - passed_repos}")
        report.append("")
        
        for result in results:
            report.append(f"## Repository: {result['repository']}")
            report.append(f"**Status:** {'✅ PASSED' if result['overall_passed'] else '❌ FAILED'}")
            report.append(f"**Path:** {result['path']}")
            report.append("")
            
            if result["dockerfiles"]:
                report.append("### Dockerfile Validation")
                for df_result in result["dockerfiles"]:
                    status = "✅ PASSED" if df_result["passed"] else "❌ FAILED"
                    report.append(f"- {df_result['dockerfile']}: {status}")
                    if not df_result["passed"] and "issues" in df_result:
                        for issue in df_result["issues"]:
                            report.append(f"  - {issue.get('level', 'ERROR')}: {issue.get('message', 'Unknown issue')}")
                report.append("")
            
            if result["images"]:
                report.append("### Image Validation")
                for img_result in result["images"]:
                    status = "✅ PASSED" if img_result["passed"] else "❌ FAILED"
                    tool = img_result["tool"]
                    image = img_result.get("image", "unknown")
                    report.append(f"- {tool} scan of {image}: {status}")
                report.append("")
        
        return "\n".join(report)

def main():
    parser = argparse.ArgumentParser(description="Docker Image Validation Tool")
    parser.add_argument("--repos", nargs="+", help="Repository paths to validate")
    parser.add_argument("--config", help="Path to configuration file")
    parser.add_argument("--output", help="Output file for validation report")
    parser.add_argument("--format", choices=["text", "json"], default="text", help="Output format")
    
    args = parser.parse_args()
    
    validator = DockerImageValidator(args.config)
    
    if not args.repos:
        print("Error: No repositories specified")
        print("Supported repositories:")
        for repo in validator.supported_repos:
            print(f"  - {repo}")
        sys.exit(1)
    
    results = []
    for repo_path in args.repos:
        if not os.path.exists(repo_path):
            print(f"Warning: Repository path {repo_path} does not exist")
            continue
            
        repo_name = os.path.basename(repo_path)
        result = validator.validate_repository(repo_path, repo_name)
        results.append(result)
    
    if args.format == "json":
        output = json.dumps(results, indent=2)
    else:
        output = validator.generate_report(results)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"Validation report written to {args.output}")
    else:
        print(output)
    
    if any(not r["overall_passed"] for r in results):
        sys.exit(1)

if __name__ == "__main__":
    main()
