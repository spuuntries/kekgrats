module.exports = {
  // Event names and their corresponding rewards
  events: {
    "weekly art": 0,
    "weekly poetry": 1,
    "monthly music": 2,
    "monthly writing": 3,
  },
  // Array of event rewards
  rewards: [
    { winner: 50, participant: 25 },
    { winner: 50, participant: 25 },
    { winner: 100, participant: 50 },
    { winner: 100, participant: 50 },
  ],
  // Array of event channel IDs
  channels: [
    "717098680175015936",
    "717098680175015936",
    "717098680175015936",
    "717098680175015936",
  ],
  /**
   * @param {String} string
   * @returns { {
   *  winner: Number,
   *  participant: Number
   *  } | undefined }
   */
  determineEventReward(string) {
    const event = string.toLowerCase(),
      filtered = Object.keys(this.events).filter((e) =>
        e.split(" ").every((a) => event.includes(a))
      );
    if (filtered.length > 0) {
      return this.rewards[this.events[filtered[0]]];
    }
    return undefined;
  },
};
