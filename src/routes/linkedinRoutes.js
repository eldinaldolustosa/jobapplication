const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const linkedinController = require('../controllers/linkedinController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: LinkedIn
 *   description: Gerenciamento de perfis LinkedIn de empresas e contatos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LinkedinCompany:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         linkedinUrl:
 *           type: string
 *           example: https://www.linkedin.com/company/tech-corp
 *         sector:
 *           type: string
 *         size:
 *           type: string
 *         website:
 *           type: string
 *         notes:
 *           type: string
 *     LinkedinContact:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         linkedinUrl:
 *           type: string
 *           example: https://www.linkedin.com/in/recrutador-exemplo
 *         type:
 *           type: string
 *           enum: [Recrutador, Colaborador]
 *         companyId:
 *           type: string
 *         title:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/linkedin/companies:
 *   post:
 *     summary: Cadastrar perfil LinkedIn de empresa (JOBAPP-11 - US06)
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, linkedinUrl]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tech Corp
 *               linkedinUrl:
 *                 type: string
 *                 example: https://www.linkedin.com/company/tech-corp
 *               sector:
 *                 type: string
 *               size:
 *                 type: string
 *               website:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Empresa cadastrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LinkedinCompany'
 *       400:
 *         description: URL do LinkedIn inválida
 *       409:
 *         description: Empresa já cadastrada
 */
router.post(
  '/companies',
  [
    body('name').notEmpty().withMessage('Nome da empresa é obrigatório'),
    body('linkedinUrl').notEmpty().withMessage('URL do LinkedIn é obrigatória'),
  ],
  validate,
  linkedinController.createCompany
);

/**
 * @swagger
 * /api/v1/linkedin/companies:
 *   get:
 *     summary: Listar empresas cadastradas
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LinkedinCompany'
 */
router.get('/companies', linkedinController.getCompanies);

/**
 * @swagger
 * /api/v1/linkedin/companies/{id}:
 *   get:
 *     summary: Obter empresa por ID
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LinkedinCompany'
 *       404:
 *         description: Empresa não encontrada
 */
router.get('/companies/:id', linkedinController.getCompany);

/**
 * @swagger
 * /api/v1/linkedin/companies/{id}:
 *   put:
 *     summary: Atualizar dados de empresa
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LinkedinCompany'
 *     responses:
 *       200:
 *         description: Empresa atualizada
 *       404:
 *         description: Empresa não encontrada
 */
router.put('/companies/:id', linkedinController.updateCompany);

/**
 * @swagger
 * /api/v1/linkedin/companies/{id}:
 *   delete:
 *     summary: Remover empresa
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Empresa removida
 *       404:
 *         description: Empresa não encontrada
 */
router.delete('/companies/:id', linkedinController.deleteCompany);

/**
 * @swagger
 * /api/v1/linkedin/contacts:
 *   post:
 *     summary: Cadastrar recrutador ou colaborador LinkedIn (JOBAPP-12 - US07)
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, linkedinUrl, type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ana Recrutadora
 *               linkedinUrl:
 *                 type: string
 *                 example: https://www.linkedin.com/in/ana-recrutadora
 *               type:
 *                 type: string
 *                 enum: [Recrutador, Colaborador]
 *               companyId:
 *                 type: string
 *               title:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Contato cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LinkedinContact'
 *       400:
 *         description: URL do LinkedIn inválida
 *       409:
 *         description: Contato já cadastrado
 */
router.post(
  '/contacts',
  [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('linkedinUrl').notEmpty().withMessage('URL do LinkedIn é obrigatória'),
    body('type').isIn(['Recrutador', 'Colaborador']).withMessage('Tipo deve ser Recrutador ou Colaborador'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Observações deve ter no máximo 500 caracteres'),
  ],
  validate,
  linkedinController.createContact
);

/**
 * @swagger
 * /api/v1/linkedin/contacts:
 *   get:
 *     summary: Listar contatos cadastrados
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Recrutador, Colaborador]
 *         description: Filtrar por tipo de contato
 *     responses:
 *       200:
 *         description: Lista de contatos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LinkedinContact'
 */
router.get('/contacts', linkedinController.getContacts);

/**
 * @swagger
 * /api/v1/linkedin/contacts/{id}:
 *   get:
 *     summary: Obter contato por ID
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LinkedinContact'
 *       404:
 *         description: Contato não encontrado
 */
router.get('/contacts/:id', linkedinController.getContact);

/**
 * @swagger
 * /api/v1/linkedin/contacts/{id}:
 *   put:
 *     summary: Atualizar dados de contato
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LinkedinContact'
 *     responses:
 *       200:
 *         description: Contato atualizado
 *       404:
 *         description: Contato não encontrado
 */
router.put('/contacts/:id', linkedinController.updateContact);

/**
 * @swagger
 * /api/v1/linkedin/contacts/{id}:
 *   delete:
 *     summary: Remover contato
 *     tags: [LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Contato removido
 *       404:
 *         description: Contato não encontrado
 */
router.delete('/contacts/:id', linkedinController.deleteContact);

module.exports = router;
