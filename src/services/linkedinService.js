const LinkedinCompany = require('../models/LinkedinCompany');
const LinkedinContact = require('../models/LinkedinContact');

const COMPANY_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/company\//;
const CONTACT_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\//;

const validateCompanyUrl = (url) => {
  if (!COMPANY_URL_REGEX.test(url)) {
    const error = new Error('URL deve ser um perfil válido do LinkedIn de empresa (linkedin.com/company/...)');
    error.status = 400;
    throw error;
  }
};

const validateContactUrl = (url) => {
  if (!CONTACT_URL_REGEX.test(url)) {
    const error = new Error('URL deve ser um perfil pessoal válido do LinkedIn (linkedin.com/in/...)');
    error.status = 400;
    throw error;
  }
};

const createCompany = async (userId, data) => {
  validateCompanyUrl(data.linkedinUrl);
  const existing = await LinkedinCompany.findOne({ userId, linkedinUrl: data.linkedinUrl });
  if (existing) {
    const error = new Error('Empresa já cadastrada');
    error.status = 409;
    throw error;
  }
  return LinkedinCompany.create({ userId, ...data });
};

const findAllCompanies = async (userId) => {
  return LinkedinCompany.find({ userId }).sort({ createdAt: -1 });
};

const findCompanyById = async (id, userId) => {
  const company = await LinkedinCompany.findOne({ _id: id, userId });
  if (!company) {
    const error = new Error('Empresa não encontrada');
    error.status = 404;
    throw error;
  }
  return company;
};

const updateCompany = async (id, userId, data) => {
  if (data.linkedinUrl) validateCompanyUrl(data.linkedinUrl);
  const company = await findCompanyById(id, userId);
  Object.assign(company, data);
  return company.save();
};

const deleteCompany = async (id, userId) => {
  const company = await findCompanyById(id, userId);
  await company.deleteOne();
};

const createContact = async (userId, data) => {
  validateContactUrl(data.linkedinUrl);
  const existing = await LinkedinContact.findOne({ userId, linkedinUrl: data.linkedinUrl });
  if (existing) {
    const error = new Error('Contato já cadastrado');
    error.status = 409;
    throw error;
  }
  return LinkedinContact.create({ userId, ...data });
};

const findAllContacts = async (userId, type) => {
  const filter = { userId };
  if (type) filter.type = type;
  return LinkedinContact.find(filter).sort({ createdAt: -1 });
};

const findContactById = async (id, userId) => {
  const contact = await LinkedinContact.findOne({ _id: id, userId });
  if (!contact) {
    const error = new Error('Contato não encontrado');
    error.status = 404;
    throw error;
  }
  return contact;
};

const updateContact = async (id, userId, data) => {
  if (data.linkedinUrl) validateContactUrl(data.linkedinUrl);
  const contact = await findContactById(id, userId);
  Object.assign(contact, data);
  return contact.save();
};

const deleteContact = async (id, userId) => {
  const contact = await findContactById(id, userId);
  await contact.deleteOne();
};

module.exports = {
  createCompany, findAllCompanies, findCompanyById, updateCompany, deleteCompany,
  createContact, findAllContacts, findContactById, updateContact, deleteContact,
};
