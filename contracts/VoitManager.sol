// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

struct Data {
    address candidate;
    uint count;
}

contract Voit
{    
    VoitManager ownerContract;
    uint public dateStartVoit;
    uint daysOffset = 3 days;
    bool isFinished;
    string public name;
    Data[] public candidats;
    mapping (address => bool) payments;

    constructor(string memory _name, address[] memory _candidats) {
        name = _name;        
        for (uint i = 0; i < _candidats.length; ++i) {
            candidats.push(Data(_candidats[i], 0));
        }
        dateStartVoit = block.timestamp;
        ownerContract = VoitManager(msg.sender);
    }

    function equal2Candidats(address _candidate) private view returns(bool) {
        for (uint i = 0; i < candidats.length; ++i){
            if (candidats[i].candidate == _candidate)
            return true;
        }
        return false;
    }

    modifier voitNotEnd {
        require(block.timestamp < dateStartVoit + daysOffset, "voiting isn`t end!");
        _;
    }

    modifier voitEnd {
        require(block.timestamp > dateStartVoit + daysOffset, "voiting is underway!");
        _;
    }

    modifier voitChek(address _candidate) {
        require(msg.value == 0.01 ether, "voit cost 0.01 ether!" );
        require(equal2Candidats(_candidate), "candidate not listed");
        require(!payments[msg.sender], "you already voted");
        _;
    }

    modifier voitNoMonay {
        require(address(this).balance != 0, "out of money!");
        _;
    }

    function voit(address _candidate) external voitNotEnd voitChek(_candidate) payable {       
        for (uint i = 0; i < candidats.length; ++i){
            if (candidats[i].candidate == _candidate){
                candidats[i].count++;
                break;
            }
        }
        payments[msg.sender] = true;
    }

    function close() external voitEnd voitNoMonay{
        require(!isFinished, "voit was be closed!");
        uint maxIndex = 0;
        address winner;
        for (uint i = 0; i < candidats.length; ++i) {
            if (candidats[i].count > maxIndex) {
                maxIndex = candidats[i].count;
                winner = candidats[i].candidate;
            }
        }
        payable(winner).transfer(address(this).balance - (address(this).balance/100 * 10));
        isFinished = true;
    }

    function getTax() external voitEnd voitNoMonay {
        require(isFinished, "voit don`t closed!");
        require(msg.sender == ownerContract.owner(), "you not an owner!");
        address payable _to = payable(ownerContract.owner());
        _to.transfer(address(this).balance);
    }
   
    function getCand() external view returns(Data[] memory) {
        return candidats;
    }

    function setEndVoit() external {
        daysOffset = 0;
    }
}


contract VoitManager
{
    address public owner;
    address public lastvoit;
    Voit[] voits;

    modifier onlyOwner {
        require(msg.sender == owner, "You are not an owner!");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createVoit(
                string memory _name, 
                address[] memory candidats
            ) external onlyOwner returns(address) 
    {
        Voit newVoit = new Voit(_name, candidats);
        voits.push(newVoit);
        lastvoit = address(newVoit);
        return lastvoit;
    }

    struct Var {
        Voit voit;
        string name;
    }

    function getVoits() external view returns(Var[] memory) {
        Var[] memory arr = new Var[](voits.length);
        for(uint i = 0; i < voits.length; ++i) {
            arr[i] = Var(voits[i], voits[i].name());
        }
        return arr;
    }

}