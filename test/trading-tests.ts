import { deployMGearBattleForEquipTests } from "./util";
import { ethers } from "hardhat";
import { itemsByStrength } from "./items";
import { expect } from "chai";

type StatNames = "ruin" | "guard" | "vigor" | "celerity";

describe("Trading tests", function () {
  it("equip items", async function () {
    const { mfiends, dummyMGear } = await deployMGearBattleForEquipTests();
    const [owner, otherGuy] = await ethers.getSigners();
    console.log("!!!", itemsByStrength.length);
    const l = itemsByStrength.length;
    await mfiends.connect(owner).equipItems(1, 2, 3, 4);
    await mfiends.connect(otherGuy).equipItems(1 + l, 2 + l, 3 + l, 4 + l);

    dummyMGear.connect(owner).transferFrom(owner.address, otherGuy.address, 1);

    try {
      await mfiends.connect(owner).mint(1352, false);
      throw new Error("should not throw");
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'eq 0'"
      );
    }

    // equip an item you own
    await mfiends.connect(owner).equipItems(5, 2, 3, 4);

    // owner can mint now
    try {
      await mfiends.connect(owner).mint(1352, false);
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'did not defeat'"
      );
    }
  });

  it("someone else equipping your item should be okay", async function () {
    const { mfiends, dummyMGear } = await deployMGearBattleForEquipTests();
    const [owner, otherGuy] = await ethers.getSigners();

    const l = itemsByStrength.length;
    await mfiends.connect(owner).equipItems(1, 2, 3, 4);
    await mfiends.connect(otherGuy).equipItems(1 + l, 2 + l, 3 + l, 4 + l);

    // send item 1 to other guy
    await dummyMGear.connect(owner).transferFrom(owner.address, otherGuy.address, 1);

    // now other guy equips item 1
    await mfiends.connect(otherGuy).equipItems(1, 2 + l, 3 + l, 4 + l);

    // owner can't mint
    try {
      await mfiends.connect(owner).mint(1352, false);
      throw new Error("should not throw");
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'eq 0'"
      );
    }

    // owner equips a different item
    await mfiends.connect(owner).equipItems(5, 2, 3, 4);

    // owner can mint now
    try {
      await mfiends.connect(owner).mint(1352, false);
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'did not defeat'"
      );
    }
  });
});
