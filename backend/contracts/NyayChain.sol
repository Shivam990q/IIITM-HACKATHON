// SPDX-License-Identifier: MIT
// This line is a standard license identifier.
pragma solidity ^0.8.20; // This tells the computer which version of Solidity (the language) to use.

/**
 * @title NyayChain
 * @dev This is the smart contract for our public grievance system.
 * It's a digital rulebook that can't be changed.
 */
contract NyayChain {

    // This is a template for what a "Complaint" looks like.
    // It holds all the information for a single complaint.
    struct Complaint {
        uint id; // A unique ID number for each complaint.
        address reporter; // The wallet address of the citizen who filed it.
        string description; // The user's description of the problem.
        string imageHash; // The unique link to the photo on IPFS (decentralized storage).
        string latitude; // The GPS latitude.
        string longitude; // The GPS longitude.
        uint timestamp; // The exact time the complaint was filed.
        string status; // The current status: "Open", "In Progress", "Resolved".
    }

    // This is a counter that gives each new complaint a unique ID.
    uint public complaintCounter;

    // This is our public database. It's a list that stores every single complaint.
    // It links a complaint ID (a number) to the full Complaint details.
    mapping(uint => Complaint) public complaints;

    // "Events" are like public announcements. Our website will listen for these
    // to know when something important happens on the blockchain.
    event ComplaintFiled(uint id, address indexed reporter, string description, uint timestamp);
    event StatusUpdated(uint id, string newStatus);

    // This is a special function that runs only once when we first deploy the contract.
    constructor() {
        complaintCounter = 0;
    }

    /**
     * @dev This function lets any citizen file a new complaint.
     * This is a "write" transaction because it adds new data to the blockchain.
     */
    function createComplaint(
        string memory _description,
        string memory _imageHash,
        string memory _latitude,
        string memory _longitude
    ) public {
        complaintCounter++; // Increase the counter to get a new ID.

        // Create the new complaint record using the template we defined above.
        complaints[complaintCounter] = Complaint(
            complaintCounter,
            msg.sender, // Automatically gets the wallet address of the person submitting.
            _description,
            _imageHash,
            _latitude,
            _longitude,
            block.timestamp, // Automatically gets the current time from the blockchain.
            "Open" // All new complaints will start with the status "Open".
        );

        // Make a public announcement that a new complaint has been filed.
        emit ComplaintFiled(complaintCounter, msg.sender, _description, block.timestamp);
    }

    /**
     * @dev This function lets us update the status of a complaint.
     * For the hackathon, we'll make it public so we can easily show status changes in our demo.
     */
    function updateStatus(uint _id, string memory _newStatus) public {
        // First, check if a complaint with this ID actually exists.
        require(_id > 0 && _id <= complaintCounter, "Complaint does not exist.");

        // If it exists, update its status.
        complaints[_id].status = _newStatus;

        // Announce that the status has been updated.
        emit StatusUpdated(_id, _newStatus);
    }
}