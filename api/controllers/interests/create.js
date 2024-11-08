/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = {
  
    // Action to create a new interest
    async create(req, res) {
      try {
        const { name } = req.body;
    
        // Check if the interest already exists with the same name
        const existingInterest = await Interests.findOne({ name });
        if (existingInterest) {
          return res.status(400).json({ error: 'Interest with this name already exists.' });
        }
    
        // Create a new interest if it doesn't already exist
        const createdInterest = await Interests.create({ name }).fetch();
        return res.status(201).json(createdInterest);
      } catch (error) {
        return res.serverError(error);
      }
    }
}