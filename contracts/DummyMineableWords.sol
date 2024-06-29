pragma solidity >=0.8.0 <0.9.0;

import "./ERC721Enumerable.sol";

contract DummyMineableWords is ERC721Enumerable {
  uint88 private constant LENGTH_MASK = (2**4 - 1) << (88 - 8);
  uint8 private constant LENGTH_SHIFT_WIDTH = 84 - 4;
  uint88 private constant CHAR_MASK = 2**5 - 1;
  uint8 private constant REMOVE_BOUNTY_DELAY_BLOCKS = 3;

  uint88[] private wordLengthMasks;
  bytes public characters;

  constructor() ERC721("DummyMineableWords", "DummyToken") {
    for (uint8 i = 97; i < 123; i++) {
      characters.push(bytes1(i));
    }

    characters.push(bytes1("_"));
    characters.push(bytes1("!"));
    characters.push(bytes1("."));
    characters.push(bytes1("@"));
    characters.push(bytes1("&"));
    characters.push(bytes1("?"));

    ERC721._safeMint(msg.sender, 0x037b9cf000000000000000);
    ERC721._safeMint(msg.sender, 0x0488165900000000000000);
    ERC721._safeMint(msg.sender, 0x0490248900000000000000);
    ERC721._safeMint(msg.sender, 0x0613973736400000000000);
    ERC721._safeMint(address(0x123), 232754);
  }

  function mint(uint256 mword) public {
    ERC721._safeMint(msg.sender, mword);
  }

  function decodeMword(uint88 encoded) public view returns (string memory) {
    uint8 length = uint8((encoded & LENGTH_MASK) >> LENGTH_SHIFT_WIDTH) + 1;

    bytes memory decodedCharacters = new bytes(length);
    for (uint256 i = 0; i < length; i++) {
      uint8 shiftWidth = uint8(80 - (5 * (i + 1)));
      uint88 bitMask = CHAR_MASK << shiftWidth;
      uint8 character = uint8((encoded & bitMask) >> shiftWidth);
      decodedCharacters[i] = characters[character];
    }

    return string(decodedCharacters);
  }
}
