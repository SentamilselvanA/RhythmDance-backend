const Faculty = require('../models/Faculty');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const getFileUrl = async (file) => {
  if (!file) return null;
  if (file.path) return { url: file.path, publicId: file.filename }; // Cloudinary
  if (isCloudinaryConfigured()) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      { folder: 'dance-school', transformation: [{ width: 800, height: 800, crop: 'limit' }] }
    );
    return { url: result.secure_url, publicId: result.public_id };
  }
  return null;
};

exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFaculty = async (req, res) => {
  try {
    if (!req.params.id.match(/^[a-f\d]{24}$/i))
      return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    res.json({ success: true, faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const fileData = await getFileUrl(req.file);
    if (fileData) { req.body.image = fileData.url; req.body.imagePublicId = fileData.publicId; }
    if (typeof req.body.specialization === 'string') req.body.specialization = JSON.parse(req.body.specialization);
    if (typeof req.body.qualifications === 'string') req.body.qualifications = JSON.parse(req.body.qualifications);
    const faculty = await Faculty.create(req.body);
    res.status(201).json({ success: true, faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    if (!req.params.id.match(/^[a-f\d]{24}$/i))
      return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
    const existing = await Faculty.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Faculty not found' });
    const fileData = await getFileUrl(req.file);
    if (fileData) {
      if (existing.imagePublicId) await cloudinary.uploader.destroy(existing.imagePublicId).catch(console.error);
      req.body.image = fileData.url;
      req.body.imagePublicId = fileData.publicId;
    }
    if (typeof req.body.specialization === 'string') req.body.specialization = JSON.parse(req.body.specialization);
    if (typeof req.body.qualifications === 'string') req.body.qualifications = JSON.parse(req.body.qualifications);
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    if (!req.params.id.match(/^[a-f\d]{24}$/i))
      return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    if (faculty.imagePublicId) await cloudinary.uploader.destroy(faculty.imagePublicId).catch(console.error);
    await faculty.deleteOne();
    res.json({ success: true, message: 'Faculty deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
