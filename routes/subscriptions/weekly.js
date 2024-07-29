const express = require('express');
const router = express.Router();
// pagar boleto com checkout transparente


router.post(
    "/pix/:clienteId",
  
    async (req, res) => {
      try {
        const token = process.env.ACCESS_TOKEN;
        const custumerId = req.params.custumerId; // Agora é uma string
  
        // Encontra o cliente associado ao atendente
        const customer = await Customer.findOne({ custumerId: custumerId });
  
        if (!customer) {
          return res.status(404).json({ message: "Cliente não encontrado." });
        }
  
        // Encontra o asaasCustomerId do cliente
        const asaasCustomerId = customer.asaasCustomerId;
        console.log("Produtos no carrinho:", cart.products);
  
        // Cria uma string vazia para armazenar os IDs dos produtos
        let externalReferences = "";
  
        // Itera sobre os produtos no carrinho
        for (const product of cart.products) {
          // Adiciona o ID do produto à string externalReferences
          externalReferences += product.productId._id + ",";
        }
  
        // Remove a vírgula extra no final da string externalReferences
        externalReferences = externalReferences.slice(0, -1);
  
        // Apaga os registros de frete anteriores
        const data = {
          billingType: "BOLETO",
          customer: asaasCustomerId, // Substitui 'cus_000005895208' pelo asaasCustomerId
          value: cart.totalAmount,
          dueDate: new Date(), // Define a data atual como a data de vencimento
        };
  
        const response = await axios.post(
          "https://sandbox.asaas.com/api/v3/payments",
          data,
          {
            headers: {
              accept: " 'application/json'",
              "content-type": "application/json",
              access_token: token,
            },
          }
        );
  
        // Verifica se a resposta é um array
        if (Array.isArray(response.data)) {
          // Se for um array, faz um loop sobre os itens e salva cada um
          for (const item of response.data) {
            const boleto = new Boleto({
              orderId: item.id,
              billingType: "BOLETO",
              custumerId: custumerId, // Agora é uma string
              customer: item.customer,
              billingType: item.billingType,
              value: item.value,
              externalReference: item.externalReference,
              invoiceUrl: item.invoiceUrl,
              bankSlipUrl: item.bankSlipUrl,
              dueDate: item.dueDate,
              shippingFeeData: {
                transportadora: cart.transportadora.nome || "",
                logo: cart.logo.img || "",
                shippingFeePrice: cart.shippingFee,
              },
              products: cart.products.map((product) => ({
                productId: product.productId._id,
                quantity: product.quantity,
                size: product.size,
                color: product.color,
                image: product.image,
                name: product.name,
                price: product.price,
              })),
              name: customer.name,
            });
  
            await boleto.save();
          }
        } else {
          // Se não for um array, salva apenas um item
          const boleto = new Boleto({
            billingType: "BOLETO",
            custumerId: custumerId, // Agora é uma string
            customer: response.data.customer,
            billingType: response.data.billingType,
            value: response.data.value,
            externalReference: response.data.externalReference,
            invoiceUrl: response.data.invoiceUrl,
            bankSlipUrl: response.data.bankSlipUrl,
            dueDate: response.data.dueDate,
            shippingFeeData: {
              transportadora: cart.transportadora.nome || "",
              logo: cart.logo.img || "",
              shippingFeePrice: cart.shippingFee,
            },
            products: cart.products.map((product) => ({
              productId: product.productId._id,
              quantity: product.quantity,
              size: product.size,
              color: product.color,
              image: product.image,
              name: product.name,
              price: product.price,
  
            })),
            name: customer.name,
            orderId: response.data.id,
            name: customer.name,
  
          });
  
          await boleto.save();
        }
  
        res.json(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  module.exports = router;