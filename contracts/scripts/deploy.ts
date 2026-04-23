import { ethers } from "hardhat";

const USDC = "0x3600000000000000000000000000000000000000";
const DECIMALS = 6;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatUnits(await ethers.provider.getBalance(deployer.address), 18), "USDC");

  const Vault = await ethers.getContractFactory("SimpleYieldVault");
  const vault = await Vault.deploy(USDC, DECIMALS);
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log("\n✅ SimpleYieldVault deployed at:", address);
  console.log("\n📝 Now update lib/contracts.ts:");
  console.log(`   const VAULT_ADDRESS = '${address}'`);
  console.log("   export const USE_VAULT = true");
}

main().catch((err) => { console.error(err); process.exit(1); });
