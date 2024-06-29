pragma solidity >=0.8.0 <0.9.0;

import "./ERC721Enumerable.sol";

contract DummyMineablePunks is ERC721Enumerable {
  mapping(uint256 => uint96) public punkIdToAssets;

  constructor() ERC721("DummyMineablePunks", "DummyPunkToken") {
    ERC721._safeMint(msg.sender, 10000);
    ERC721._safeMint(msg.sender, 10001);
    ERC721._safeMint(msg.sender, 10002);
    ERC721._safeMint(msg.sender, 10003);
    ERC721._safeMint(address(0x123), 10004);

    //reg
    punkIdToAssets[10000] = 0x4000000000017003A003E00;
    //zombie
    punkIdToAssets[10001] = 0x9000000000017003A003E00;
    //ape
    punkIdToAssets[10002] = 0xa000000000017003A003E00;
    //alient
    punkIdToAssets[10003] = 0xb000000000017003A003E00;
    //not owner
    punkIdToAssets[10004] = 0x1000000000017003A003E00;
  }

  function mint(uint256 punk) public {
    ERC721._safeMint(msg.sender, punk);
    punkIdToAssets[punk] = 0x1000000000017003A003E00;
  }
}
