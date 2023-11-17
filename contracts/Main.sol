// SPDX-License-Identifier: MIT

pragma solidity >0.8.0;

import "./ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract main is IERC721Receiver{
    IERC20 immutable NATIVE;
    address immutable owner;
    mapping(address => bool) solvers;
    Item[] items;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier onlySolver {
        require(solvers[msg.sender]);
        _;
    }

    struct Item {
        address publisher;
        uint256 price;
        uint256 sold;
        string itemName;
        ERC721Con nftaddress;
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
        require(bytes(_itemName).length > 0 && bytes(_nftShortname).length > 0);
        ERC721Con nftaddress = new ERC721Con(_itemName, _nftShortname);
        Item memory newitem = Item(msg.sender, _price, 0, _itemName, nftaddress);
        items.push(newitem);
        return (items.length - 1);
    }

    function addSolver(address _address) external onlyOwner {
        solvers[_address] = true;
    }

    function delSolver(address _address) external onlyOwner {
        solvers[_address] = false;
    }

    function solverApproval(address _seller, address _buyer, uint256 _price, uint256 _gameID, uint256 _tokenID) external onlySolver{
        require(NATIVE.allowance(_buyer, address(this)) >= _price);
        
        NATIVE.transferFrom(_buyer, _seller, _price);
        (items[_gameID].nftaddress).safeTransferFrom(_seller, _buyer, _tokenID);
    }

    function buy(uint256 _gameID, uint256 _tokenID) external {
        require(NATIVE.allowance(msg.sender, address(this)) >= items[_gameID].price);
        require((items[_gameID].nftaddress).balanceOf(msg.sender) == 0);

        Item memory temp = items[_gameID];

        NATIVE.transferFrom(msg.sender, temp.publisher, temp.price);
        (temp.nftaddress).safeMint(msg.sender);
    }

    function lib(address _userAddress, uint256 _gameID) external view returns(bool){
        if((items[_gameID].nftaddress).balanceOf(msg.sender) > 0){
            return true;
        } else {
            return false;
        }
    }
}