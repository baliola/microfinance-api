path "secret/data/pk/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "secret/data/pk/creditor/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "secret/data/pk/debtor/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}