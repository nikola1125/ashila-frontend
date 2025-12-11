import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: '#111827',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #e5e7eb',
  },
  itemImage: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 10,
    color: '#6b7280',
  },
  total: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1px solid #e5e7eb',
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
  },
});

const InvoicePDF = ({ orderData, sessionId }) => {
  const formatCurrency = (amount) => {
    return `${(amount / 100).toLocaleString()} ALL`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Invoice</Text>
              <Text style={styles.label}>Order ID: {sessionId}</Text>
            </View>
            <View>
              <Text style={{ ...styles.label, textAlign: 'right' }}>Date</Text>
              <Text style={styles.value}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ ...styles.label, marginBottom: 8 }}>BILL TO</Text>
          <Text style={styles.value}>{orderData.customer_email}</Text>
        </View>

        <View style={{ ...styles.section, marginTop: 30 }}>
          <Text
            style={{ ...styles.label, marginBottom: 8, fontWeight: 'bold' }}
          >
            ORDER SUMMARY
          </Text>

          {Array.isArray(orderData?.items?.data) &&
            orderData.items.data.map((item, index) => (
              <View key={index} style={styles.item}>
                {item.price.product.images?.[0] && (
                  <Image
                    src={item.price.product.images[0]}
                    style={styles.itemImage}
                  />
                )}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.description}</Text>
                  <Text style={styles.itemMeta}>
                    Qty: {item.quantity} •{' '}
                    {formatCurrency(item.price.unit_amount)} each
                  </Text>
                  <Text style={styles.itemMeta}>
                    Sold by: {item.price.product.metadata?.seller || 'N/A'}
                  </Text>
                </View>
                <Text style={styles.value}>
                  {formatCurrency(item.amount_total)}
                </Text>
              </View>
            ))}
        </View>

        <View style={styles.total}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(orderData.amount_subtotal)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>0 ALL</Text>
          </View>
          <View style={{ ...styles.totalRow, marginTop: 10 }}>
            <Text style={styles.grandTotal}>Total</Text>
            <Text style={styles.grandTotal}>
              {formatCurrency(orderData.amount_total)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 40, textAlign: 'center' }}>
          <Text style={{ fontSize: 10, color: '#9ca3af' }}>
            Thank you for your purchase!
          </Text>
          <Text style={{ fontSize: 8, color: '#9ca3af', marginTop: 4 }}>
            This is an automated invoice, no signature required.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
