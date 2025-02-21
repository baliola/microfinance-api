#!/bin/bash

# Check if the vault-config.json file exists
if [ -f vault-config.json ]; then
  # Read the VAULT_PID from the vault-config.json (if it was saved previously)
  VAULT_PID=$(jq -r '.VAULT_PID' vault-config.json)

  if [ -z "$VAULT_PID" ]; then
    echo "Vault PID not found in vault-config.json. Is the server running?"
    exit 1
  fi

  # Stop the Vault server by killing its process
  echo "Stopping Vault server (PID: $VAULT_PID)..."
  kill $VAULT_PID

  # Give Vault some time to shut down cleanly
  sleep 5

  # Check if the Vault process is still running, and force kill it if necessary
  if ps -p $VAULT_PID > /dev/null; then
    echo "Forcefully killing Vault server..."
    kill -9 $VAULT_PID
  fi

  # Ensure any Vault-related resources are cleaned up
  rm -f vault.pid
  rm -f vault-config.json
  rm -f vault-output.txt
  echo "Vault server stopped and resources cleaned up."
else 
  echo "Vault configuration file (vault-config.json) not found. Is the server running?"
fi