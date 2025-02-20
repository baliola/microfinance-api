<div align="center">

# Microfinance API

![TypeScript version](https://img.shields.io/badge/TypeScript-5.1.3%2B-007ACC?style=for-the-badge&logo=typescript)
![Ethers version](https://img.shields.io/badge/ethers-6.13.5-white?style=for-the-badge&logo=ethers)
![NestJS version](https://img.shields.io/badge/nestjs-10.4.9-red?style=for-the-badge&logo=nestjs)
![Vault version](https://img.shields.io/badge/vault-6.13.5-yellow?style=for-the-badge&logo=hashicorp)
![Documentation](https://img.shields.io/badge/docs-Google%20Docs-FEBE10?style=for-the-badge)

This project involves the collaborative integration of services between Mandala Chain and the DJoin Kocek platform. This integration will be carried out by Baliola and DJoin. This project is a component of research and development efforts for the DJoin Kocek service, utilizing Mandala Chain technology. The integration will be based on API communication with a blockchain node.

</div>

## ⚡️ Quick Start

### 📋 Prerequisites

- **Node.JS `22.12.0`** : A JavaScript runtime that allows developers to run JavaScript on the server-side. Node.js provides a rich library of modules that simplifies the development of web applications.
- **TypeScript `^5.1.3`** : A superset of JavaScript that allows specifying the types of data being passed around within the code, and has the ability to report errors when the types don't match.

The project also uses some packages like:

- **Nest.JS `10.4.9`** : A framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).
- **Ethers `^6.13.5`** : A complete and compact library for interacting with the Ethereum Blockchain and its ecosystem.
- **@litehex/node-vault `^1.0.2`** : A JavaScript/TypeScript library that helps app interact with Vault by HashiCorp and it acts as a bridge between your code and Vault.

$~$

## 💻 Initial Setup

### Development Environment Setup

1. **Install Dependencies**: Run the following command to install all necessary dependencies:

```bash
  yarn install
```

2. **Run Vault Server Locally**: Run the following command to make the Vault Server run:

```bash
  yarn vault:start
```

3. **Blockchain Node Active**: Make sure blockchain node that integrated with API is on and smart contract already deployed.
4. **Copy DataSharing.json**: Copy file `DataSharing.json` to folder `src/artifact`

5. **Run Server**: Run the following command to run the server

```bash
  yarn start:dev
```

$~$

### Production Environment Setup

1. **Install Dependencies**: Run the following command to install all necessary dependencies:

```bash
  yarn install
```

2. **Run Vault Server Locally**: Run the following command to make the Vault Server run:
3. **Compile the Code**: Compile the code for production environment by running this command:

```bash
  yarn build
```

4. **Blockchain Node Active**: Make sure blockchain node that integrated with API is on and smart contract already deployed.
5. **Copy DataSharing.json**: Copy file `DataSharing.json` to folder `src/artifact`

6. **Run Server**: Run the following command to run the server

```bash
  yarn start:prod
```

## 🧪 Test Case
For running test with several options, you can use command test:

```
  yarn test:watch
```
