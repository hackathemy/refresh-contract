//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ProjectToken.sol";

contract MyProtocol {
  event ProjectCreated(
    uint indexed contentIndex,
    address indexed projectBuilder,
    string contentURI,
    address tokenAddress // Added to store the token contract address
  );

  struct Project {
    uint contentIndex;
    address projectBuilder;
    string contentURI;
    address tokenAddress; // Added to store the token contract address
  }

  mapping(uint => Project) public projects;

  uint latestProjectIndex;

  constructor() {
    //  not mint
  }

  // create a new prject and mint erc20votes
  function createProject(
    string calldata _contentURI,
    string calldata tokenName,
    string calldata tokenSymbol
  ) external {
    // Increment the index to get a new unique index for the project
    latestProjectIndex++;

    // Create a new ERC20 token for the project
    ProjectToken newToken = new ProjectToken(tokenName, tokenSymbol);

    // Store a new project
    Project storage newProject = projects[latestProjectIndex];
    newProject.contentIndex = latestProjectIndex;
    newProject.projectBuilder = msg.sender;
    newProject.contentURI = _contentURI;
    newProject.tokenAddress = address(newToken); // Store the token contract address

    // Emit the ProjectCreated event
    emit ProjectCreated(
      latestProjectIndex,
      msg.sender,
      _contentURI,
      address(newToken)
    );
  }

  function getProjectsCount() external view returns (uint) {
    return latestProjectIndex;
  }

  // getter function call project uri for frontend to query this uri
  function getProjectContentURI(
    uint projectIndex
  ) external view returns (string memory) {
    require(
      projectIndex > 0 && projectIndex <= latestProjectIndex,
      "Invalid project index"
    );
    return projects[projectIndex].contentURI;
  }
}
