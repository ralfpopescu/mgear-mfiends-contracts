pragma solidity >=0.8.0 <0.9.0;

import "./ERC721Enumerable.sol";

contract DummyMGear is ERC721Enumerable {
  mapping(uint256 => uint256) public tokenIdToMGear;

  constructor() ERC721("DummyMGear", "DummyMGearToken") {
    // dummy
    ERC721._safeMint(msg.sender, 0);
  }

  function mint(
    uint256 mgearId,
    uint256 mgearAssets,
    address addr
  ) public {
    ERC721._safeMint(addr, mgearId);
    tokenIdToMGear[mgearId] = mgearAssets;
  }
}
