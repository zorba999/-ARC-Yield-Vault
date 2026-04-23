// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleYieldVault
 * @notice ARC Testnet demo yield vault — no allowlist required.
 * Accepts USDC, mints yUSDC shares. Price grows ~5% APY to simulate US Treasury yield.
 */
contract SimpleYieldVault {
    string public name = "ARC Yield USDC";
    string public symbol = "yUSDC";
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public immutable asset;
    uint256 public immutable deployedAt;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed caller, address indexed receiver, uint256 assets, uint256 shares);
    event Redeem(address indexed caller, address indexed receiver, uint256 assets, uint256 shares);

    constructor(address _asset, uint8 _decimals) {
        asset = _asset;
        decimals = _decimals;
        deployedAt = block.timestamp;
    }

    // ─── ERC-20 ──────────────────────────────────────────────────────────────

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    // ─── Vault price (5% APY simulated) ──────────────────────────────────────

    /**
     * @notice Price of 1 yUSDC in USDC (6 decimals). Starts at 1.000000 and grows ~5%/year.
     */
    function currentPrice() public view returns (uint256) {
        uint256 elapsed = block.timestamp - deployedAt;
        // 5% per year = price * elapsed * 5 / (365 * 86400 * 100)
        return 1_000_000 + (1_000_000 * elapsed * 5) / (365 * 86_400 * 100);
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        return (assets * 1_000_000) / currentPrice();
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        return (shares * currentPrice()) / 1_000_000;
    }

    function previewDeposit(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    function previewRedeem(uint256 shares) external view returns (uint256) {
        return convertToAssets(shares);
    }

    function maxDeposit(address) external pure returns (uint256) {
        return type(uint256).max;
    }

    // For oracle compatibility with StatsBar
    function latestAnswer() external view returns (int256) {
        return int256(currentPrice());
    }

    // ─── Vault actions ────────────────────────────────────────────────────────

    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        require(assets > 0, "Zero assets");
        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");

        _safeTransferFrom(asset, msg.sender, address(this), assets);
        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets) {
        require(shares > 0, "Zero shares");
        assets = convertToAssets(shares);
        require(assets > 0, "Zero assets");

        if (msg.sender != owner) {
            uint256 allowed = allowance[owner][msg.sender];
            if (allowed != type(uint256).max) allowance[owner][msg.sender] = allowed - shares;
        }

        _burn(owner, shares);
        _safeTransfer(asset, receiver, assets);

        emit Redeem(msg.sender, receiver, assets, shares);
    }

    // ─── Internals ────────────────────────────────────────────────────────────

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        unchecked { balanceOf[to] += amount; }
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        unchecked { totalSupply -= amount; }
        emit Transfer(from, address(0), amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        balanceOf[from] -= amount;
        unchecked { balanceOf[to] += amount; }
        emit Transfer(from, to, amount);
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "TransferFrom failed");
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }
}
