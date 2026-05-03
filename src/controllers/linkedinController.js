const linkedinService = require('../services/linkedinService');

const createCompany = async (req, res, next) => {
  try {
    const company = await linkedinService.createCompany(req.userId, req.body);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
};

const getCompanies = async (req, res, next) => {
  try {
    const companies = await linkedinService.findAllCompanies(req.userId);
    res.json(companies);
  } catch (err) {
    next(err);
  }
};

const getCompany = async (req, res, next) => {
  try {
    const company = await linkedinService.findCompanyById(req.params.id, req.userId);
    res.json(company);
  } catch (err) {
    next(err);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const company = await linkedinService.updateCompany(req.params.id, req.userId, req.body);
    res.json(company);
  } catch (err) {
    next(err);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    await linkedinService.deleteCompany(req.params.id, req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const createContact = async (req, res, next) => {
  try {
    const contact = await linkedinService.createContact(req.userId, req.body);
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await linkedinService.findAllContacts(req.userId, req.query.type);
    res.json(contacts);
  } catch (err) {
    next(err);
  }
};

const getContact = async (req, res, next) => {
  try {
    const contact = await linkedinService.findContactById(req.params.id, req.userId);
    res.json(contact);
  } catch (err) {
    next(err);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const contact = await linkedinService.updateContact(req.params.id, req.userId, req.body);
    res.json(contact);
  } catch (err) {
    next(err);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    await linkedinService.deleteContact(req.params.id, req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCompany, getCompanies, getCompany, updateCompany, deleteCompany,
  createContact, getContacts, getContact, updateContact, deleteContact,
};
