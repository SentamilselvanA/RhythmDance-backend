const mongoose = require('mongoose');
require('dotenv').config();

const Faculty = require('../models/Faculty');
const Class = require('../models/Class');
const FAQ = require('../models/FAQ');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed Faculty
    const facultyCount = await Faculty.countDocuments();
    if (facultyCount === 0) {
      await Faculty.insertMany([
        { name: 'Lakshmi Raghavan', specialization: ['Bharatanatyam', 'Classical'], experience: 18, bio: 'Award-winning Bharatanatyam artist trained under Guru Padma Subramaniam.', email: 'lakshmi@rhythmdance.com', mobile: '+91 98765 43210', image: 'https://i.pravatar.cc/300?img=10' },
        { name: 'Karan Nair', specialization: ['Hip Hop', 'Western', 'Contemporary'], experience: 12, bio: 'Former professional dancer and Bollywood choreographer.', email: 'karan@rhythmdance.com', mobile: '+91 98765 43211', image: 'https://i.pravatar.cc/300?img=12' },
        { name: 'Meera Pillai', specialization: ['Contemporary', 'Ballet'], experience: 15, bio: 'International performer with expertise in European contemporary dance.', email: 'meera@rhythmdance.com', mobile: '+91 98765 43212', image: 'https://i.pravatar.cc/300?img=20' },
        { name: 'Arjun Dev', specialization: ['Folk', 'Kids Dance'], experience: 8, bio: 'Specialist in regional folk dance traditions.', email: 'arjun@rhythmdance.com', mobile: '+91 98765 43213', image: 'https://i.pravatar.cc/300?img=15' },
      ]);
      console.log('✅ Faculty seeded');
    }

    // Seed Classes
    const classCount = await Class.countDocuments();
    if (classCount === 0) {
      const faculty = await Faculty.find();
      await Class.insertMany([
        { title: 'Bharatanatyam Fundamentals', description: 'Learn the foundational movements, mudras, and expressions of classical Bharatanatyam dance.', category: 'Bharatanatyam', ageGroup: '8-18 years', duration: '60 minutes', fees: 2500, instructor: faculty[0]?._id, schedule: [{ day: 'Monday', startTime: '17:00', endTime: '18:00' }, { day: 'Wednesday', startTime: '17:00', endTime: '18:00' }], image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=300&fit=crop' },
        { title: 'Hip Hop Street Dance', description: 'Master urban dance styles including breaking, locking, and freestyle hip hop.', category: 'Hip Hop', ageGroup: '12-25 years', duration: '60 minutes', fees: 2000, instructor: faculty[1]?._id, schedule: [{ day: 'Tuesday', startTime: '18:00', endTime: '19:00' }, { day: 'Thursday', startTime: '18:00', endTime: '19:00' }], image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=300&fit=crop' },
        { title: 'Contemporary Dance', description: 'Explore fluid, expressive movement blending modern and postmodern techniques.', category: 'Contemporary', ageGroup: '15-30 years', duration: '75 minutes', fees: 2800, instructor: faculty[2]?._id, schedule: [{ day: 'Saturday', startTime: '10:00', endTime: '11:15' }], image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=300&fit=crop' },
        { title: 'Kids Fun Dance', description: 'Fun, age-appropriate dance program building coordination, creativity and confidence in children.', category: 'Kids', ageGroup: '4-10 years', duration: '45 minutes', fees: 1500, instructor: faculty[3]?._id, schedule: [{ day: 'Saturday', startTime: '09:00', endTime: '09:45' }, { day: 'Sunday', startTime: '09:00', endTime: '09:45' }], image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=400&h=300&fit=crop' },
        { title: 'Western Ballroom', description: 'Elegant ballroom dancing including Waltz, Foxtrot, and Latin styles.', category: 'Western', ageGroup: '16+ years', duration: '60 minutes', fees: 3000, instructor: faculty[1]?._id, schedule: [{ day: 'Friday', startTime: '19:00', endTime: '20:00' }], image: 'https://images.unsplash.com/photo-1537484987248-69b3312bb720?w=400&h=300&fit=crop' },
        { title: 'Folk Dance Traditions', description: 'Celebrate India\'s rich cultural heritage through various regional folk dance forms.', category: 'Folk', ageGroup: 'All ages', duration: '60 minutes', fees: 1800, instructor: faculty[3]?._id, schedule: [{ day: 'Sunday', startTime: '11:00', endTime: '12:00' }], image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop' },
      ]);
      console.log('✅ Classes seeded');
    }

    // Seed FAQs
    const faqCount = await FAQ.countDocuments();
    if (faqCount === 0) {
      await FAQ.insertMany([
        { question: 'What age groups do you accept?', answer: 'We welcome students of all ages! We have programs for kids (4–12), teens (13–17), and adults (18+).', category: 'General', order: 1 },
        { question: 'Do I need prior dance experience?', answer: 'No prior experience required. We have beginner, intermediate, and advanced classes.', category: 'Enrollment', order: 2 },
        { question: 'How do I enroll?', answer: 'Apply online through our Apply Now page or visit us in person. Free trial classes available.', category: 'Enrollment', order: 3 },
        { question: 'What are the fee structures?', answer: 'Monthly fees range from ₹1,500–₹3,000 depending on the course. Contact us for details.', category: 'Fees', order: 4 },
        { question: 'Are there performance opportunities?', answer: 'Yes! We organize annual recitals, competitions, and regular stage performance opportunities.', category: 'General', order: 5 },
        { question: 'What should I wear to class?', answer: 'Comfortable, flexible clothing suitable for movement. Specific requirements vary by dance style.', category: 'General', order: 6 },
      ]);
      console.log('✅ FAQs seeded');
    }

    // Seed Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        academyName: 'Rhythm Dance Academy',
        tagline: 'Where Every Step Tells a Story',
        email: 'info@rhythmdance.com',
        phone: '+91 98765 43210',
        address: '123 Dance Avenue, Arts District, Chennai - 600001',
        socialMedia: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', youtube: 'https://youtube.com' },
      });
      console.log('✅ Settings seeded');
    }

    // Seed Welcome Notification
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.create({
        title: 'Welcome to Rhythm Dance Academy!',
        message: 'We\'re thrilled to have you here. Explore our classes and start your dance journey today!',
        type: 'Announcement',
        targetRole: 'all',
      });
      console.log('✅ Notifications seeded');
    }

    console.log('\n🎉 Seed completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
