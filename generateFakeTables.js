function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function getRandomElement(arr) {
    return arr[getRandomInt(0, arr.length - 1)];
  }
  
  function getRandomDate(days) {
    const today = new Date();
    const randomDays = getRandomInt(0, days); // Randomly choose days between 0 and the specified max
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + randomDays); // Set the date to today + random days
    const hours = getRandomInt(6, 18); // Random hour between 6 AM and 6 PM
    return `${futureDate.getDate().toString().padStart(2, '0')}-${(futureDate.getMonth() + 1).toString().padStart(2, '0')}-${futureDate.getFullYear()} ${hours.toString().padStart(2, '0')}:00`;
  }
  
  function generateSingleEventData() {
    const cities = [
      { name: "Chennai", lat: 13.0827, lng: 80.2707 },
      { name: "Madras", lat: 13.0827, lng: 80.2707 },
      { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
      { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
      { name: "Pondicherry", lat: 11.9338, lng: 79.8298 },
      { name: "Puducherry", lat: 11.9338, lng: 79.8298 }
    ];
  
    const titles = [
      "Coastal Cleanup Drive",
      "Tech Innovation Seminar",
      "History Walk through Madras",
      "Startup Networking Event",
      "Meditation Retreat",
      "Design Thinking Workshop",
      "Wildlife Photography",
      "Seaside Business Forum",
      "Art Exhibition Tour",
      "Leadership Development Meetup",
      "Morning Yoga Session",
      "AI in Business Workshop",
      "Beach Volleyball Tournament",
      "Blockchain for Enterprises",
      "Surfing Workshop for Beginners",
      "Cybersecurity for Startups",
      "Nature Photography Walk",
      "Business Strategy Masterclass",
      "Cultural Heritage Walk",
      "SaaS Growth Conference"
    ];
  
    const descriptions = [
      "Join the event to clean the beach and save the environment.",
      "A seminar for business professionals to discuss cutting-edge technology.",
      "Explore the historic landmarks of Madras with a guided tour.",
      "Meet and network with upcoming startups and investors.",
      "A peaceful meditation retreat to rejuvenate your mind and soul.",
      "A comprehensive workshop on design thinking for professionals.",
      "Capture the wild beauty of nature at Guindy National Park.",
      "Engage with top professionals in a beachside business event.",
      "Join us for an exclusive art exhibition in the heart of the city.",
      "Build your leadership skills with industry veterans.",
      "Start your day with a refreshing yoga session by the sea.",
      "Learn how AI is transforming business operations.",
      "Join the fun and compete in a beach volleyball tournament.",
      "Understand how blockchain can impact large enterprises.",
      "Learn the basics of surfing at one of the best beaches.",
      "An in-depth discussion on cybersecurity for modern startups.",
      "Capture the essence of nature at the famous Lalbagh Gardens.",
      "A masterclass on how to build a winning business strategy.",
      "Explore the rich culture and history of Mylapore.",
      "A deep dive into growing a SaaS business."
    ];
  
    const city = getRandomElement(cities);
    const category = getRandomInt(32, 57);
    const type = getRandomInt(1, 2);
    
    const event = {
      type: type,
      address: `${city.name}, ${type === 2 ? "Event Location" : "Some Place"}`,
      event_date: getRandomDate(7), // Get a random date within the next 7 days
      min_seats: 5,
      max_seats: 5,
      created_for: 1032,
      title: getRandomElement(titles),
      description: getRandomElement(descriptions),
      category: category,
      ...(type === 2 && { price: getRandomInt(100, 600) }), // Price for type 2 only
      tags: getRandomElement(["Beginners", "Experts", "Business"]),
      location: {
        lat: city.lat,
        lng: city.lng
      },
      table_expense: 1
    };
  
    return event;
  }
  
  // Generate and log a single event
  const singleEventData = generateSingleEventData();
  console.log(JSON.stringify(singleEventData, null, 2));
  