import express from 'express';
import braintree from 'braintree';
import gateway from '../lib/gateway';

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/checkouts/new');
});

router.get('/checkouts/new', (req, res) => {
  res.render('new.ejs', {clientToken: res.clientToken});
});

router.get('/checkouts/:id', (req, res) => {
  let result;
  const transactionId = req.params.id;

  gateway.transaction.find(transactionId, (err, transaction) => {
    result = createResultObject(transaction);
    res.render('checkouts/show', {transaction, result});
  });
});

router.post('/checkouts', (req, res) => {
  let transactionErrors;
  const amount = req.body.amount; // In production you should not take amounts directly from clients
  const nonce = req.body.payment_method_nonce;

  gateway.transaction.sale({
    amount,
    paymentMethodNonce: nonce,
    options: {
      submitForSettlement: true
    }
  }, (err, result) => {
    if (result.success || result.transaction) {
      res.redirect('checkouts/' + result.transaction.id);
    } else {
      transactionErrors = result.errors.deepErrors();
      req.flash('error', {msg: formatErrors(transactionErrors)});
      res.redirect('checkouts/new');
    }
  });
});

router.get('/client_token', (req,res) => {
  gateway.clientToken.generate({}, (err, response) => {
    res.send(response.clientToken);
  });
});

export default router;
