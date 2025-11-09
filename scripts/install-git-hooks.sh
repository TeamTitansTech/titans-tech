#!/bin/bash

# Script to install Git hooks for the project
# Run this script once after cloning the repository

set -e

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Installing Git Hooks                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get the root directory of the git repository
GIT_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$GIT_ROOT/.githooks"
GIT_HOOKS_DIR="$GIT_ROOT/.git/hooks"

# Check if .githooks directory exists
if [ ! -d "$HOOKS_DIR" ]; then
    echo -e "${YELLOW}⚠️  .githooks directory not found!${NC}"
    echo "Expected location: $HOOKS_DIR"
    exit 1
fi

# Configure git to use the custom hooks directory
echo -e "${BLUE}📝 Configuring Git to use custom hooks directory...${NC}"
git config core.hooksPath .githooks

# Make all hooks executable
echo -e "${BLUE}🔧 Making hooks executable...${NC}"
chmod +x "$HOOKS_DIR"/*

echo ""
echo -e "${GREEN}✅ Git hooks installed successfully!${NC}"
echo ""
echo -e "Installed hooks:"
for hook in "$HOOKS_DIR"/*; do
    if [ -f "$hook" ]; then
        hook_name=$(basename "$hook")
        echo -e "  ${GREEN}✓${NC} $hook_name"
    fi
done

echo ""
echo -e "${BLUE}ℹ️  Hook details:${NC}"
echo -e "  • ${YELLOW}pre-push${NC}: Prevents direct pushes to main branch"
echo ""
echo -e "${YELLOW}Note:${NC} You can bypass hooks with --no-verify flag (use with caution)"
echo ""
