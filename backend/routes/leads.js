const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

// In-memory storage for leads (in production, use database)
let leads = [];

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Submit new lead
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, course, message, source } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Name and email are required' 
      });
    }

    // Create lead object
    const lead = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      course: course || '',
      message: message || '',
      source: source || 'chatbot',
      timestamp: new Date().toISOString(),
      status: 'new'
    };

    // Store lead
    leads.push(lead);

    // Send email notification
    try {
      await sendLeadNotification(lead);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      await sendUserConfirmation(lead);
    } catch (emailError) {
      console.error('User confirmation email failed:', emailError);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Lead submitted successfully',
      leadId: lead.id
    });

  } catch (error) {
    console.error('Error submitting lead:', error);
    res.status(500).json({ 
      error: 'Failed to submit lead',
      details: error.message 
    });
  }
});

// Get all leads (admin only)
router.get('/', (req, res) => {
  res.json({ leads });
});

// Get lead by ID
router.get('/:id', (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  res.json({ lead });
});

// Update lead status
router.patch('/:id', (req, res) => {
  const { status, notes } = req.body;
  const lead = leads.find(l => l.id === req.params.id);
  
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  lead.status = status || lead.status;
  lead.notes = notes || lead.notes;
  lead.updatedAt = new Date().toISOString();

  res.json({ success: true, lead });
});

// Lead analytics endpoint
router.get('/analytics', (req, res) => {
  const today = new Date().toDateString();
  const leadsToday = leads.filter(lead => new Date(lead.timestamp).toDateString() === today).length;
  const sourceBreakdown = leads.reduce((acc, lead) => {
    acc[lead.source || 'unknown'] = (acc[lead.source || 'unknown'] || 0) + 1;
    return acc;
  }, {});
  const statusBreakdown = leads.reduce((acc, lead) => {
    acc[lead.status || 'new'] = (acc[lead.status || 'new'] || 0) + 1;
    return acc;
  }, {});
  res.json({
    totalLeads: leads.length,
    leadsToday,
    conversionRate: leads.length ? ((statusBreakdown.enrolled || 0) / leads.length) * 100 : 0,
    sourceBreakdown,
    statusBreakdown,
  });
});

// Email notification to admin
async function sendLeadNotification(lead) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `New Lead: ${lead.name} - ${lead.course || 'General Inquiry'}`,
    html: `
      <h2>New Lead Submission</h2>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Phone:</strong> ${lead.phone || 'Not provided'}</p>
      <p><strong>Course:</strong> ${lead.course || 'Not specified'}</p>
      <p><strong>Message:</strong> ${lead.message || 'No additional message'}</p>
      <p><strong>Source:</strong> ${lead.source}</p>
      <p><strong>Submitted:</strong> ${new Date(lead.timestamp).toLocaleString()}</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Confirmation email to user
async function sendUserConfirmation(lead) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: lead.email,
    subject: 'Thank you for your inquiry - College Admission',
    html: `
      <h2>Thank you for your inquiry!</h2>
      <p>Dear ${lead.name},</p>
      <p>Thank you for contacting us about ${lead.course || 'our programs'}. We have received your inquiry and our admissions team will get back to you within 24-48 hours.</p>
      <p><strong>Your inquiry details:</strong></p>
      <ul>
        <li>Course: ${lead.course || 'General inquiry'}</li>
        <li>Message: ${lead.message || 'No additional message'}</li>
      </ul>
      <p>In the meantime, you can:</p>
      <ul>
        <li>Visit our website: www.college.edu</li>
        <li>Call us: +1-555-123-4568</li>
        <li>Email us: admissions@college.edu</li>
      </ul>
      <p>Best regards,<br>Admissions Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router; 