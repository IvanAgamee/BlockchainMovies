// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract Adoption {

    address[16] public adopters;

// Adopting a pet
function adopt(uint petId) public returns (uint) {
  require(petId >= 0 && petId <= 15);

  adopters[petId] = msg.sender;

  return petId;
}

    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }

function getAdoptedPetsByAddress(address adopterAddress) public view returns (uint[] memory) {
    uint[] memory adoptedPetIds = new uint[](16);
    uint count = 0;

    for (uint i = 0; i < adopters.length; i++) {
        if (adopters[i] == adopterAddress) {
            adoptedPetIds[count] = i;
            count++;
        }
    }

    uint[] memory result = new uint[](count);
    for (uint j = 0; j < count; j++) {
        result[j] = adoptedPetIds[j];
    }

    return result;
}
}