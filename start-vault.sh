#!/bin/bash

# Clean up any leftover files from previous runs
if [ -f vault.pid ]; then
  echo "Found leftover vault.pid. Removing it..."
  rm -f vault.pid
fi

# Start Vault server in dev mode
echo "Starting Vault server in dev mode..."
vault server -dev -dev-listen-address="127.0.0.1:8200" > vault-output.txt 2>&1 &

# Store process ID (PID) of Vault
VAULT_PID=$!
echo $VAULT_PID > vault.pid

# Wait for Vault to start
echo "Waiting for Vault to start..."
while ! grep -q 'Root Token:' vault-output.txt; do
  sleep 3
done
echo "Vault started successfully."

# Extract Unseal Key and Root Token
UNSEAL_KEY=$(grep 'Unseal Key:' vault-output.txt | awk '{print $NF}')
ROOT_TOKEN=$(grep 'Root Token:' vault-output.txt | awk '{print $NF}')

if [ -z "$UNSEAL_KEY" ] || [ -z "$ROOT_TOKEN" ]; then
    echo "Failed to extract Unseal Key or Root Token. Check vault-output.txt for errors."
    exit 1
fi

# Store Vault-related variables in a JSON file
echo "Saving Vault configuration to vault-config.json..."
cat <<EOF > vault-config.json
{
  "VAULT_ADDR": "http://127.0.0.1:8200",
  "VAULT_UNSEAL_KEY": "$UNSEAL_KEY",
  "VAULT_ROOT_TOKEN": "$ROOT_TOKEN",
  "VAULT_PID": "$VAULT_PID"
}
EOF

# Use jq to read values from the JSON file
if ! command -v jq &> /dev/null; then
  echo "jq is required to parse JSON. Please install jq."
  exit 1
fi

# Read Vault configuration from the JSON file
VAULT_ADDR=$(jq -r '.VAULT_ADDR' vault-config.json)
VAULT_UNSEAL_KEY=$(jq -r '.VAULT_UNSEAL_KEY' vault-config.json)
VAULT_ROOT_TOKEN=$(jq -r '.VAULT_ROOT_TOKEN' vault-config.json)

# Export values to environment variables
export VAULT_ADDR
export VAULT_UNSEAL_KEY
export VAULT_ROOT_TOKEN

# Debug: Print the values
echo "VAULT_ADDR: $VAULT_ADDR"
echo "VAULT_UNSEAL_KEY: $VAULT_UNSEAL_KEY"
echo "VAULT_ROOT_TOKEN: $VAULT_ROOT_TOKEN"

# Enable KV secrets engine
vault secrets enable -version=2 kv || {
  echo "Error enabling secrets engine"
  exit 1
}

# Create a policy
vault policy write allow-secrets allow-secret.hcl || {
  echo "Error uploading policy"
  exit 1
}

# Create a token
vault token create -policy="allow-secrets" || {
  echo "Error creating token"
  exit 1
}

# Final status
echo "Vault Address, Unseal Key, and Root Token saved to vault-config.json."
echo "Vault PID: $VAULT_PID"
