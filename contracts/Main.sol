// SPDX-License-Identifier: MIT

pragma solidity >0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract main is IERC721Receiver, ERC4907{
    IERC20 immutable NATIVE;
    address immutable owner;
    mapping(address => bool) solvers;
    Item[] items;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier onlySoler {
        require(solvers[msg.sender]);
        _;
    }

    struct Item {
        address publisher;
        uint256 price;
        uint256 sold;
        string itemName;
        ERC721 nftaddress;
    }

    constructor(IERC20 _native){
        owner = msg.sender;
        NATIVE = _native;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function addItem(string memory _itemName, string memory _nftShortname, uint256 _price) external returns(uint256 itemID) {
        require(bytes(_test).length > 0 && bytes(_nftShortname).length > 0);
        ERC721 nftaddress = new ERC721(_itemName, _nftShortname);
        Item memory newitem = Item(msg.sender, price, 0, _itemName, nftaddress);
        items.push(newitem);
        return (items.length - 1);
    }

    function addSolver(address _address) external onlyOwner {
        solvers[_address] = true;
    }

    function delSolver(address _address) external onlyOwner {
        solvers[_address] = false;
    }
}