// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CrowdFunding
 * @dev ChainFund — Decentralized Crowdfunding Smart Contract
 * @notice Deploy on Sepolia via Remix IDE (remix.ethereum.org)
 */
contract CrowdFunding {
    struct Campaign {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 goal;       // In Wei
        uint256 raised;     // In Wei
        uint256 deadline;   // Unix timestamp
        bool withdrawn;
        uint256 contributorsCount;
    }

    struct Contribution {
        address contributor;
        uint256 amount;
        bytes32 txHash;
        uint256 timestamp;
    }

    Campaign[] public campaigns;
    mapping(uint256 => Contribution[]) public contributions;

    event CampaignCreated(uint256 indexed id, address indexed creator, string title, uint256 goal);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount);

    function createCampaign(
        string calldata title,
        string calldata description,
        uint256 goal,
        uint256 durationDays
    ) external {
        require(bytes(title).length >= 5, "Title too short");
        require(goal > 0, "Goal must be > 0");
        require(durationDays >= 1 && durationDays <= 365, "Invalid duration");

        uint256 id = campaigns.length;
        campaigns.push(Campaign({
            id: id,
            creator: msg.sender,
            title: title,
            description: description,
            goal: goal,
            raised: 0,
            deadline: block.timestamp + (durationDays * 1 days),
            withdrawn: false,
            contributorsCount: 0
        }));

        emit CampaignCreated(id, msg.sender, title, goal);
    }

    function contribute(uint256 campaignId) external payable {
        require(campaignId < campaigns.length, "Campaign not found");
        Campaign storage campaign = campaigns[campaignId];
        require(block.timestamp < campaign.deadline, "Campaign expired");
        require(msg.value > 0, "Must send ETH");

        campaign.raised += msg.value;
        campaign.contributorsCount += 1;

        contributions[campaignId].push(Contribution({
            contributor: msg.sender,
            amount: msg.value,
            txHash: blockhash(block.number - 1),
            timestamp: block.timestamp
        }));

        emit ContributionMade(campaignId, msg.sender, msg.value);
    }

    function withdraw(uint256 campaignId) external {
        require(campaignId < campaigns.length, "Campaign not found");
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.creator, "Not creator");
        require(campaign.raised >= campaign.goal, "Goal not reached");
        require(!campaign.withdrawn, "Already withdrawn");

        campaign.withdrawn = true;
        uint256 amount = campaign.raised;

        (bool success, ) = payable(campaign.creator).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(campaignId, campaign.creator, amount);
    }

    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getCampaign(uint256 id) external view returns (
        uint256,
        address,
        string memory,
        string memory,
        uint256,
        uint256,
        uint256,
        bool,
        uint256
    ) {
        require(id < campaigns.length, "Campaign not found");
        Campaign storage c = campaigns[id];
        return (c.id, c.creator, c.title, c.description, c.goal, c.raised, c.deadline, c.withdrawn, c.contributorsCount);
    }

    function getContributions(uint256 campaignId) external view returns (Contribution[] memory) {
        return contributions[campaignId];
    }
}
