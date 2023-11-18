// SPDX-License-Identifier: MIT

pragma solidity >0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    uint256 immutable expirationTime;
    mapping(uint256 => uint256) expirationDates;

    constructor(string memory _tokenName, uint256 _expirationTime)
        ERC721(_tokenName, "PRV")
        Ownable(msg.sender)
    {
        expirationTime = _expirationTime;
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        if(expirationTime > 0){
            expirationDates[tokenId] = block.timestamp + expirationTime;
        }
        _safeMint(to, tokenId);
    }

    function getExpireDate(uint256 _tokenID) external view returns(uint256) {
        return expirationDates[_tokenID];
    }

    function isExpired(uint256 _tokenID) external view returns(bool){
        if(expirationTime > 0){
            if(block.timestamp < expirationDates[_tokenID]){
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}

contract main{
    IERC20 immutable NATIVE;
    address immutable owner;
    address immutable CCIP;
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

    modifier onlyCCIP {
        require(msg.sender == CCIP);
        _;
    }

    struct Item {
        address publisher;
        uint256 price;
        uint256 sold;
        string itemName;
        NFT nftaddress;
    }

    constructor(IERC20 _native, address _CCIPaddress){
        owner = msg.sender;
        NATIVE = _native;
        CCIP = _CCIPaddress;
    }

    function addItem(string memory _itemName, string memory _nftShortname, uint256 _price, uint256 _expirationTime) external returns(uint256 itemID) {
        require(bytes(_itemName).length > 0 && bytes(_nftShortname).length > 0);
        NFT nftaddress = new NFT(_itemName, _expirationTime);
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

    function solverApproval(address _seller, address _buyer, uint256 _price, uint256 _itemID, uint256 _tokenID) external onlySolver{
        require(NATIVE.allowance(_buyer, address(this)) >= _price);
        
        NATIVE.transferFrom(_buyer, _seller, _price);
        (items[_itemID].nftaddress).safeTransferFrom(_seller, _buyer, _tokenID);
    }

    function buy(uint256 _gameID) external {
        require(NATIVE.allowance(msg.sender, address(this)) >= items[_gameID].price);
        require((items[_gameID].nftaddress).balanceOf(msg.sender) == 0);

        Item memory temp = items[_gameID];

        NATIVE.transferFrom(msg.sender, temp.publisher, temp.price);
        (temp.nftaddress).safeMint(msg.sender);
    }

    function lib(address _userAddress, uint256 _itemID) external view returns(bool){
        if((items[_itemID].nftaddress).balanceOf(_userAddress) > 0){
            return true;
        } else {
            return false;
        }
    }

    function CCIP_mint(address _buyer, uint256 _itemID) external onlyCCIP{
        (items[_itemID].nftaddress).safeMint(_buyer);
    }
}