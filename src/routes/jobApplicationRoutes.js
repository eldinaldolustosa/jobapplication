const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jobApplicationController = require('../controllers/jobApplicationController');
const stageController = require('../controllers/stageController');
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { STAGES } = require('../models/JobApplication');

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: JobApplications
 *   description: Gerenciamento de candidaturas de emprego
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JobApplication:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         company:
 *           type: string
 *         position:
 *           type: string
 *         description:
 *           type: string
 *         salary:
 *           type: number
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *         applicationDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [Enviado, Feedback, Entrevista, Entrevista Técnica, Negociação, Contrato]
 *         resume:
 *           type: object
 *           properties:
 *             filename:
 *               type: string
 *             originalName:
 *               type: string
 *             uploadedAt:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Stage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         jobApplicationId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Enviado, Feedback, Entrevista, Entrevista Técnica, Negociação, Contrato]
 *         date:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/job-applications:
 *   post:
 *     summary: Cadastrar nova candidatura (JOBAPP-8 - US03)
 *     tags: [JobApplications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company, position, applicationDate]
 *             properties:
 *               company:
 *                 type: string
 *                 example: Tech Corp
 *               position:
 *                 type: string
 *                 example: Backend Developer
 *               description:
 *                 type: string
 *               salary:
 *                 type: number
 *                 example: 8000
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["VR", "VT", "Plano de Saúde"]
 *               applicationDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-01"
 *     responses:
 *       201:
 *         description: Candidatura criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApplication'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/',
  [
    body('company').notEmpty().withMessage('Empresa é obrigatória'),
    body('position').notEmpty().withMessage('Cargo é obrigatório'),
    body('applicationDate').isISO8601().withMessage('Data de aplicação deve estar no formato ISO 8601'),
    body('salary').optional().isFloat({ min: 0 }).withMessage('Salário deve ser um valor numérico positivo'),
  ],
  validate,
  jobApplicationController.create
);

/**
 * @swagger
 * /api/v1/job-applications:
 *   get:
 *     summary: Listar todas as candidaturas do usuário
 *     tags: [JobApplications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de candidaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobApplication'
 */
router.get('/', jobApplicationController.findAll);

/**
 * @swagger
 * /api/v1/job-applications/{id}:
 *   get:
 *     summary: Obter candidatura por ID
 *     tags: [JobApplications]
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
 *         description: Candidatura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobApplication'
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Candidatura não encontrada
 */
router.get('/:id', jobApplicationController.findOne);

/**
 * @swagger
 * /api/v1/job-applications/{id}:
 *   put:
 *     summary: Atualizar candidatura
 *     tags: [JobApplications]
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
 *             $ref: '#/components/schemas/JobApplication'
 *     responses:
 *       200:
 *         description: Candidatura atualizada
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Candidatura não encontrada
 */
router.put('/:id', jobApplicationController.update);

/**
 * @swagger
 * /api/v1/job-applications/{id}:
 *   delete:
 *     summary: Remover candidatura
 *     tags: [JobApplications]
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
 *         description: Candidatura removida
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Candidatura não encontrada
 */
router.delete('/:id', jobApplicationController.remove);

/**
 * @swagger
 * /api/v1/job-applications/{id}/stages:
 *   post:
 *     summary: Registrar nova etapa do processo seletivo (JOBAPP-10 - US05)
 *     tags: [JobApplications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, date]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Enviado, Feedback, Entrevista, Entrevista Técnica, Negociação, Contrato]
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-10"
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Etapa registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stage'
 *       400:
 *         description: Status inválido
 *       422:
 *         description: Regra de negócio violada (data retroativa ou status duplicado)
 */
router.post(
  '/:id/stages',
  [
    body('status').isIn(STAGES).withMessage(`Status deve ser um dos valores: ${STAGES.join(', ')}`),
    body('date').isISO8601().withMessage('Data deve estar no formato ISO 8601'),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Observações deve ter no máximo 1000 caracteres'),
  ],
  validate,
  stageController.addStage
);

/**
 * @swagger
 * /api/v1/job-applications/{id}/stages:
 *   get:
 *     summary: Listar histórico de etapas de uma candidatura
 *     tags: [JobApplications]
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
 *         description: Histórico de etapas em ordem cronológica
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Stage'
 */
router.get('/:id/stages', stageController.getStages);

/**
 * @swagger
 * /api/v1/job-applications/{id}/resume:
 *   post:
 *     summary: Enviar currículo PDF para uma candidatura (JOBAPP-9 - US04)
 *     tags: [JobApplications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [resume]
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Currículo enviado com sucesso
 *       413:
 *         description: Arquivo excede o tamanho máximo (5MB)
 *       415:
 *         description: Formato de arquivo não suportado (apenas PDF)
 */
router.post('/:id/resume', resumeController.uploadResume);

/**
 * @swagger
 * /api/v1/job-applications/{id}/resume:
 *   get:
 *     summary: Consultar currículo de uma candidatura
 *     tags: [JobApplications]
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
 *         description: Dados do currículo
 *       404:
 *         description: Nenhum currículo encontrado
 */
router.get('/:id/resume', resumeController.getResume);

module.exports = router;
