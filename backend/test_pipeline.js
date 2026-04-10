const dotenv = require('dotenv');
dotenv.config();

const eventController = require('./controllers/eventController');

const req = {
  body: {
    user_input: "Massive cyberattack hits major US shipping ports, causing indefinite delays in supply chains."
  }
};

const res = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log("FINAL PIPELINE RESPONSE:");
    if (data.error) {
      console.log("Status:", this.statusCode);
      console.log("Error:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("Success! Pipeline ran to completion.");
      console.log("- is_relevant in Agent 1:", data.event_analysis.is_relevant);
      console.log("- Agents 2, 3, 4 executed successfully.");
      console.log("Sector matches:", JSON.stringify(data.sector_mapping, null, 2));
    }
  }
};

console.log("Starting test execution...");
eventController.analyzeEvent(req, res);
