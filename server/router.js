import express from 'express';
import braintree from 'braintree';
import gateway from '../lib/gateway';

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/checkouts/new');
});

router.get('/checkouts/new', (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
    res.render('new.ejs', {clientToken: response.clientToken});
  });

});

router.get('/checkouts/:id', (req, res) => {
  let result;
  const transactionId = req.params.id;

  gateway.transaction.find(transactionId, (err, transaction) => {
    result = createResultObject(transaction);
    res.render('checkouts/show', {transaction, result});
  });
});

const formatErrors = (errors) => {
    let formattedErrors = '';

    for (var i in errors) { // eslint-disable-line no-inner-declarations, vars-on-top
          if (errors.hasOwnProperty(i)) {
                  formattedErrors += 'Error: ' + errors[i].code + ': ' + errors[i].message + '\n';
                }
        }
    return formattedErrors;
}

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


export default router;
