import React, { useState, useEffect } from 'react';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { supabase } from '../lib/supabase';

// --- PDF STYLES ---
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#5e6ad2' },
  section: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  bold: { fontWeight: 'bold' },
  muted: { color: '#666' },
  
  // Table
  table: { width: '100%', marginTop: 20 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5, marginBottom: 10, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingVertical: 8 },
  col1: { width: '50%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '20%', textAlign: 'right' },
  
  // Totals
  totalsContainer: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', width: '40%', justifyContent: 'space-between', marginBottom: 5 },
  grandTotal: { flexDirection: 'row', width: '40%', justifyContent: 'space-between', marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#333', fontWeight: 'bold', fontSize: 14 }
});

// --- PDF DOCUMENT COMPONENT ---
const InvoiceDocument = ({ data, isPro }: { data: any, isPro: boolean }) => {
  const isLogo = data.template === 'logo' || data.template === 'enveloppe';
  const isEnveloppe = data.template === 'enveloppe';
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark for non-pro users */}
        {!isPro && (
          <Text style={{
            position: 'absolute',
            top: '45%',
            left: '10%',
            opacity: 0.08,
            fontSize: 40,
            transform: 'rotate(-45deg)',
            color: '#000',
            zIndex: -1
          }}>
            Généré avec facture.mayoraz-net.ch
          </Text>
        )}
        
        {isEnveloppe ? (
          // ENVELOPPE LAYOUT (Swiss C5 Window right)
          <View style={{ marginBottom: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '45%' }}>
              {isLogo && data.logoBase64 && <Image src={data.logoBase64} style={{ maxHeight: 60, maxWidth: 150, marginBottom: 15, objectFit: 'contain' }} />}
              <Text style={styles.title}>FACTURE</Text>
              <Text style={styles.muted}>N° {data.invoiceNumber || '2023-001'}</Text>
              <Text style={styles.muted}>Date: {data.date || new Date().toLocaleDateString('fr-CH')}</Text>
            </View>
            <View style={{ width: '50%', marginTop: 20, paddingLeft: 20 }}>
              <Text style={{ fontSize: 8, color: '#888', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 3 }}>
                {data.senderName} - {data.senderAddress.replace(/\n/g, ', ')}
              </Text>
              <Text style={[styles.bold, { fontSize: 12 }]}>{data.clientName || 'Nom du Client'}</Text>
              <Text style={{ fontSize: 11, lineHeight: 1.4 }}>{data.clientAddress || 'Adresse du client'}</Text>
            </View>
          </View>
        ) : (
          // STANDARD / LOGO LAYOUT
          <View style={styles.header}>
            <View>
              {isLogo && data.logoBase64 && <Image src={data.logoBase64} style={{ maxHeight: 60, maxWidth: 150, marginBottom: 15, objectFit: 'contain' }} />}
              <Text style={styles.title}>FACTURE</Text>
              <Text style={styles.muted}>N° {data.invoiceNumber || '2023-001'}</Text>
              <Text style={styles.muted}>Date: {data.date || new Date().toLocaleDateString('fr-CH')}</Text>
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text style={styles.bold}>{data.senderName || 'Votre Entreprise'}</Text>
              <Text>{data.senderAddress || 'Votre Adresse'}</Text>
              <Text>{data.senderEmail || 'email@entreprise.com'}</Text>
              <Text>{data.senderIban ? `IBAN: ${data.senderIban}` : ''}</Text>
            </View>
          </View>
        )}

        {isEnveloppe && (
          <View style={{ marginBottom: 30 }}>
            <Text style={styles.bold}>Vos coordonnées :</Text>
            <Text>{data.senderName || 'Votre Entreprise'}</Text>
            <Text>{data.senderEmail || 'email@entreprise.com'}</Text>
            <Text>{data.senderIban ? `IBAN: ${data.senderIban}` : ''}</Text>
          </View>
        )}

        {!isEnveloppe && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={[styles.bold, { marginBottom: 5 }]}>Facturé à :</Text>
            <Text>{data.clientName || 'Nom du Client'}</Text>
            <Text>{data.clientAddress || 'Adresse du client'}</Text>
          </View>
        )}

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Description</Text>
          <Text style={styles.col2}>Qté</Text>
          <Text style={styles.col3}>Prix U.</Text>
          <Text style={styles.col4}>Total</Text>
        </View>
        
        {data.items.map((item: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.col1}>{item.desc || '...'}</Text>
            <Text style={styles.col2}>{item.qty}</Text>
            <Text style={styles.col3}>{item.price} CHF</Text>
            <Text style={styles.col4}>{(item.qty * item.price).toFixed(2)} CHF</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text>Sous-total :</Text>
          <Text>{data.subtotal.toFixed(2)} CHF</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>TVA ({data.taxRate}%) :</Text>
          <Text>{((data.subtotal * data.taxRate) / 100).toFixed(2)} CHF</Text>
        </View>
        <View style={styles.grandTotal}>
          <Text>Total :</Text>
          <Text>{(data.subtotal + (data.subtotal * data.taxRate) / 100).toFixed(2)} CHF</Text>
        </View>
      </View>
      
      {data.notes && (
        <View style={{ marginTop: 40 }}>
          <Text style={styles.bold}>Notes :</Text>
          <Text style={styles.muted}>{data.notes}</Text>
        </View>
      )}
    </Page>
  </Document>
  );
};

// --- MAIN REACT COMPONENT ---
export default function InvoiceApp() {
  const [data, setData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    senderName: '',
    senderAddress: '',
    senderEmail: '',
    senderIban: '',
    clientName: '',
    clientAddress: '',
    taxRate: 8.1,
    notes: '',
    items: [{ desc: 'Prestation de service', qty: 1, price: 100 }],
    logoBase64: null as string | null,
    template: 'standard' // 'standard', 'logo', 'enveloppe'
  });

  const [isClient, setIsClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Vérifier si l'utilisateur est Pro au chargement
    const checkProStatus = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        if (userData.user.email === 'thomasmayoraz@yahoo.com') {
          setIsPro(true);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', userData.user.id)
          .single();
        if (profile?.is_pro) {
          setIsPro(true);
        }
      }
    };
    checkProStatus();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) {
      alert("L'ajout d'un logo est une fonctionnalité de la version Pro.");
      e.target.value = '';
      return;
    }
    
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    if (!isPro && templateId !== 'standard') {
      alert("Ce modèle est exclusif à la version Pro.");
      return;
    }
    setData({ ...data, template: templateId });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData({ ...data, items: newItems });
  };

  const addItem = () => {
    setData({ ...data, items: [...data.items, { desc: '', qty: 1, price: 0 }] });
  };

  const removeItem = (index: number) => {
    if (data.items.length === 1) return;
    const newItems = data.items.filter((_, i) => i !== index);
    setData({ ...data, items: newItems });
  };

  const subtotal = data.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const total = subtotal + (subtotal * data.taxRate) / 100;

  const downloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      // 1. Vérifier l'utilisateur connecté et ses limites
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        // Récupérer le profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro, invoice_count')
          .eq('id', userData.user.id)
          .single();
          
        const isUserAdmin = userData.user.email === 'thomasmayoraz@yahoo.com';
          
        if (profile && !profile.is_pro && !isUserAdmin && profile.invoice_count >= 3) {
          alert('Vous avez atteint la limite de 3 factures gratuites. Passez à la version Pro pour générer des factures illimitées !');
          setIsGenerating(false);
          return;
        }
      }

      // 2. Générer le PDF
      const blob = await pdf(<InvoiceDocument data={{ ...data, subtotal }} isPro={isPro} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${data.invoiceNumber || 'Nouvelle'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      // 3. Sauvegarder dans la DB (si connecté)
      if (userData.user) {
        // Enregistrer l'historique
        await supabase.from('invoices').insert({
          user_id: userData.user.id,
          invoice_number: data.invoiceNumber || 'Non défini',
          client_name: data.clientName || 'Client inconnu',
          total_amount: total
        });
        
        // Incrémenter le compteur
        await supabase.rpc('increment_invoice_count', { user_id: userData.user.id });
      }
      
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération du PDF');
    }
    setIsGenerating(false);
  };

  if (!isClient) return <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>Chargement de l'éditeur...</div>;

  return (
    <div className="invoice-app">
      <div className="invoice-editor glass-card">
        <h2>Éditeur de Facture</h2>
        
        <div className="form-grid">
          <div className="form-section">
            <h3>Vos Informations</h3>
            
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Logo de l'entreprise</span>
              {!isPro && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(94,106,210,0.1)', padding: '2px 6px', borderRadius: 4 }}>PRO</span>}
            </label>
            <input 
              type="file" 
              accept="image/png, image/jpeg" 
              onChange={handleLogoUpload} 
              style={{ padding: '8px', border: '1px dashed var(--border)', width: '100%' }}
              disabled={!isPro}
            />
            {data.logoBase64 && (
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <img src={data.logoBase64} alt="Logo" style={{ maxHeight: 50, maxWidth: '100%', objectFit: 'contain' }} />
                <button onClick={() => setData({...data, logoBase64: null})} className="btn" style={{ fontSize: '0.8rem', padding: '4px 8px', marginTop: 5 }}>Retirer</button>
              </div>
            )}

            <label>Nom de l'entreprise</label>
            <input type="text" name="senderName" value={data.senderName} onChange={handleChange} placeholder="Mon Entreprise Sàrl" />
            
            <label>Adresse complète</label>
            <textarea name="senderAddress" value={data.senderAddress} onChange={handleChange} placeholder={"Rue de la Gare 1\n1000 Lausanne"} rows={2} />
            
            <label>Email de contact</label>
            <input type="email" name="senderEmail" value={data.senderEmail} onChange={handleChange} placeholder="contact@monentreprise.ch" />
            
            <label>IBAN</label>
            <input type="text" name="senderIban" value={data.senderIban} onChange={handleChange} placeholder="CH93 0000 0000 0000 0000 0" />
          </div>
          
          <div className="form-section">
            <h3>Informations Client</h3>
            <label>Nom du Client</label>
            <input type="text" name="clientName" value={data.clientName} onChange={handleChange} placeholder="Jean Dupont" />
            
            <label>Adresse du Client</label>
            <textarea name="clientAddress" value={data.clientAddress} onChange={handleChange} placeholder="Avenue des Alpes 5&#10;1200 Genève" rows={2} />
            
            <label>N° Facture & Date</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="text" name="invoiceNumber" value={data.invoiceNumber} onChange={handleChange} placeholder="F-2023-001" />
              <input type="date" name="date" value={data.date} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="items-section" style={{ marginTop: 30 }}>
          <h3>Prestations</h3>
          
          {data.items.map((item, i) => (
            <div key={i} className="item-row" style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input style={{ flex: 3 }} type="text" value={item.desc} onChange={(e) => handleItemChange(i, 'desc', e.target.value)} placeholder="Description" />
              <input style={{ flex: 1 }} type="number" value={item.qty} onChange={(e) => handleItemChange(i, 'qty', parseFloat(e.target.value) || 0)} placeholder="Qté" />
              <input style={{ flex: 1 }} type="number" value={item.price} onChange={(e) => handleItemChange(i, 'price', parseFloat(e.target.value) || 0)} placeholder="Prix (CHF)" />
              <button className="btn btn-danger" onClick={() => removeItem(i)} style={{ padding: '0 15px' }}>X</button>
            </div>
          ))}
          
          <button className="btn btn-secondary" onClick={addItem} style={{ marginTop: 10 }}>+ Ajouter une ligne</button>
        </div>

        <div className="totals-section" style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, marginBottom: 10 }}>
            <span style={{ color: 'var(--text-muted)' }}>Sous-total :</span>
            <strong>{subtotal.toFixed(2)} CHF</strong>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: 'var(--text-muted)' }}>TVA (%) :</span>
            <input type="number" name="taxRate" value={data.taxRate} onChange={handleChange} style={{ width: 80 }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, fontSize: '1.2rem', marginTop: 10, color: 'var(--primary)' }}>
            <strong>Total TTC :</strong>
            <strong>{total.toFixed(2)} CHF</strong>
          </div>
        </div>

        <div className="items-section" style={{ marginTop: 30 }}>
          <label>Notes / Conditions de paiement</label>
          <textarea
            name="notes"
            value={data.notes}
            onChange={handleChange}
            placeholder="Ex : Paiement sous 30 jours. IBAN: CH93 ..."
            rows={3}
            style={{ width: '100%', marginTop: 6 }}
          />
        </div>
      </div>
      
      <div className="invoice-sidebar">
        <div className="glass-card" style={{ padding: 30, position: 'sticky', top: 100 }}>
          <h3 style={{ marginBottom: 20 }}>Résumé</h3>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>Modèle de facture</label>
            <select 
              className="input"
              value={data.template} 
              onChange={(e) => handleTemplateChange(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
            >
              <option value="standard">Standard (Gratuit)</option>
              <option value="logo">Pro : Élégant + Logo</option>
              <option value="enveloppe">Pro : Format Enveloppe Suisse (C5)</option>
            </select>
          </div>

          <div style={{ marginBottom: 30, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span>Total à facturer :</span>
              <strong>{total.toFixed(2)} CHF</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>Lignes :</span>
              <span>{data.items.length}</span>
            </div>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: 16 }}
            onClick={downloadPDF}
            disabled={isGenerating}
          >
            {isGenerating ? 'Génération...' : '⬇️ Télécharger le PDF'}
          </button>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 15 }}>
            Facture générée localement dans votre navigateur. Votre historique est sauvegardé dans votre compte.
          </p>
        </div>
      </div>
    </div>
  );
}
