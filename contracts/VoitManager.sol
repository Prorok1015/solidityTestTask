// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

struct Data {
    address candidate;
    uint count;
}

contract Voit
{    
    uint m_DateStartVoit;
    uint c_DaysOffset = 3 days;
    bool isFinished;
    string public m_sName;
    VoitManager m_pOwnerContract;
    Data[] candidats;
    mapping (address => bool) m_lstPayments;

    function getCand() public view returns(Data[] memory) {
        return candidats;
    }
    function setEndVoit() external {
        c_DaysOffset = 0;
    }
    constructor(string memory name, address[] memory _candidats) {
        m_sName = name;        
        for (uint i = 0; i < _candidats.length; ++i) {
            candidats.push(Data(_candidats[i], 0));
        }
        m_DateStartVoit = block.timestamp;
        m_pOwnerContract = VoitManager(payable(msg.sender));
    }

    function equal2Candidats(address candidate) private view returns(bool) {
        for (uint i = 0; i < candidats.length; ++i){
            if (candidats[i].candidate == candidate)
            return true;
        }
        return false;
    }

    modifier voitNotEnd {
        require(block.timestamp < m_DateStartVoit + c_DaysOffset, "voiting isn`t end!");
        _;
    }

    modifier voitEnd {
        require(block.timestamp > m_DateStartVoit + c_DaysOffset, "voiting is underway!");
        _;
    }

    modifier voitChek(address candidate) {
        require(msg.value == 0.01 ether, "voit cost 0.01 ether!" );
        require(equal2Candidats(candidate), "candidate not listed");
        require(!m_lstPayments[msg.sender], "you already voted");
        _;
    }

    function voit(address candidate) external voitNotEnd voitChek(candidate) payable {       
        for (uint i = 0; i < candidats.length; ++i){
            if (candidats[i].candidate == candidate){
                candidats[i].count++;
                break;
            }
        }
        m_lstPayments[msg.sender] = true;
    }

    function close() external voitEnd {
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

    function getTax() external voitEnd {
        require(isFinished, "voit don`t closed!");
        require(msg.sender == m_pOwnerContract.owner(), "you not an owner!");
        address payable _to = payable(m_pOwnerContract.owner());
        _to.transfer(address(this).balance);
    }
}


contract VoitManager
{
    address public owner;
    address myAddress;
    address public lastvoit;
    Voit[] m_lstVoits;

    modifier onlyOwner {
        require(msg.sender == owner, "You are not an owner!");
        _;
    }

    constructor() {
        owner = msg.sender;
        myAddress = address(this);
    }

    function createVoit(string memory _name, address[] memory candidats) external onlyOwner returns(address){
        Voit newVoit = new Voit(_name, candidats);
        m_lstVoits.push(newVoit);
        lastvoit = address(newVoit);
        return lastvoit;
    }

    function getVoits() external view returns(Voit[] memory) {
        return m_lstVoits;
    }

}