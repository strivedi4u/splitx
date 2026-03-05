const router = require('express').Router();
const { getExpenses, getExpense, addExpense, deleteExpense, updateExpense, getGroupBalances, getMySummary } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getExpenses);                          // GET /api/expenses?groupId=xxx
router.post('/', addExpense);                          // POST /api/expenses
router.get('/summary', getMySummary);                  // GET /api/expenses/summary
router.get('/balances/:groupId', getGroupBalances);    // GET /api/expenses/balances/:groupId
router.get('/:id', getExpense);                        // GET /api/expenses/:id
router.patch('/:id', updateExpense);                   // PATCH /api/expenses/:id
router.delete('/:id', deleteExpense);                  // DELETE /api/expenses/:id

module.exports = router;
