import { useEffect, useState } from 'react'
import { CheckCircle2, Plus, Save } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { addReading, evaluateTest, generateReport, getTest } from '../services/api'

export default function TestExecution() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const detected = params.get('detected')
  const [test, setTest] = useState(null)
  const [readings, setReadings] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [evaluated, setEvaluated] = useState(null)
  const [report, setReport] = useState(null)

  useEffect(() => {
    if (!id) { setError('Select a test before opening execution.'); setLoading(false); return }
    getTest(id).then((value) => { setTest(value); setReadings([...(value.readings || []), ...(detected ? [{ testPoint: String((value.readings || []).length + 1), referenceValue: '', indicatedValue: detected, permissibleError: '0.05', source: 'SIMULATED OCR' }] : [])]) }).catch((err) => setError(err.response?.data?.error || (err.request ? 'Unable to connect to NovaNexus server.' : err.message))).finally(() => setLoading(false))
  }, [id])

  const add = () => setReadings([...readings, { testPoint: String(readings.length + 1), referenceValue: '', indicatedValue: '', permissibleError: '0.05', source: 'MANUAL' }])
  const update = (index, key, value) => setReadings(readings.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  const submitReading = async (index) => {
    const reading = readings[index]
    setSaving(true); setError('')
    try {
      await addReading(id, { testPoint: reading.testPoint, referenceValue: Number(reading.referenceValue), indicatedValue: Number(reading.indicatedValue), permissibleError: Number(reading.permissibleError), source: reading.source })
      const fresh = await getTest(id)
      const drafts = readings.filter((item, itemIndex) => itemIndex !== index && !item.id)
      setTest(fresh); setReadings([...(fresh.readings || []), ...drafts])
    } catch (err) { setError(err.response?.data?.error || (err.request ? 'Unable to connect to NovaNexus server.' : err.message)) } finally { setSaving(false) }
  }
  const evaluate = async () => { setSaving(true); setError(''); try { setEvaluated(await evaluateTest(id)); const fresh = await getTest(id); setTest(fresh); setReadings(fresh.readings || []) } catch (err) { setError(err.response?.data?.error || (err.request ? 'Unable to connect to NovaNexus server.' : err.message)) } finally { setSaving(false) } }
  const createReport = async () => { setSaving(true); setError(''); try { setReport(await generateReport(id)) } catch (err) { setError(err.response?.data?.error || (err.request ? 'Unable to connect to NovaNexus server.' : err.message)) } finally { setSaving(false) } }
  if (loading) return <div className="page"><div className="panel empty">Loading test from NovaNexus server...</div></div>
  if (!test) return <div className="page"><div className="panel empty">{error || 'Test not found.'}</div></div>
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">{test.id} / LIVE CAPTURE</p><h1>Test execution</h1><p className="muted">{test.test_type} · {test.instrument_id} · Backend-connected workflow</p></div><div className="row-actions"><button className="secondary-button" onClick={evaluate} disabled={saving}><CheckCircle2 size={16} /> Evaluate test</button><button className="primary-button" onClick={createReport} disabled={saving || !evaluated}><Save size={16} /> Generate report</button></div></div>{error && <div className="callout form-error">{error}</div>}<div className="execution-grid"><section className="panel"><div className="panel-title"><div><p className="eyebrow">INSTRUMENT</p><h2>{test.instrument_id}</h2></div><StatusBadge>{test.result}</StatusBadge></div><div className="detail-grid"><span>Manufacturer<strong>{test.manufacturer}</strong></span><span>Model<strong>{test.model}</strong></span><span>Capacity<strong>{test.capacity}</strong></span><span>Temperature<strong>{test.temperature ?? 'n/a'} °C</strong></span><span>Humidity<strong>{test.humidity ?? 'n/a'} %RH</strong></span><span>Test type<strong>{test.test_type}</strong></span></div></section><section className="panel"><div className="panel-title"><div><p className="eyebrow">EVALUATION MODE</p><h2>Configurable tolerance</h2></div><StatusBadge>{evaluated?.result || 'REVIEW'}</StatusBadge></div><div className="callout"><CheckCircle2 size={16} /><div><strong>OIML R76-based configurable evaluation.</strong><span>Prototype evaluation workflow — not legal certification.</span></div></div></section></div><section className="panel table-panel"><div className="panel-title"><div><p className="eyebrow">READINGS / {readings.length} CAPTURED</p><h2>Measurement points</h2></div><button className="secondary-button" onClick={add}><Plus size={15} /> Add reading</button></div><div className="table-wrap"><table className="reading-table"><thead><tr>{['Test point', 'Reference value', 'Indicated value', 'Error', 'Absolute error', 'Permissible error', 'Result', 'Action'].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{readings.map((reading, index) => { const reference = reading.referenceValue ?? reading.reference_value ?? ''; const indicated = reading.indicatedValue ?? reading.indicated_value ?? ''; const permissible = reading.permissibleError ?? reading.permissible_error ?? ''; const errorValue = (Number(indicated || 0) - Number(reference || 0)).toFixed(2); return <tr key={reading.id || index}><td><strong>{reading.testPoint || reading.test_point}</strong></td><td><input value={reference} onChange={(event) => update(index, 'referenceValue', event.target.value)} disabled={Boolean(reading.id)} /></td><td><input value={indicated} onChange={(event) => update(index, 'indicatedValue', event.target.value)} disabled={Boolean(reading.id)} /></td><td className="mono">{reading.error ?? errorValue}</td><td className="mono">{reading.absoluteError ?? reading.absolute_error ?? Math.abs(Number(errorValue))}</td><td><input value={permissible} onChange={(event) => update(index, 'permissibleError', event.target.value)} disabled={Boolean(reading.id)} /></td><td><StatusBadge>{reading.result || 'REVIEW'}</StatusBadge></td><td>{reading.id ? <span className="source-chip">Saved</span> : <button className="secondary-button" onClick={() => submitReading(index)} disabled={saving}>Send reading</button>}</td></tr> })}</tbody></table></div>{report && <div className="success-banner"><CheckCircle2 size={18} /> Report {report.id} generated and hashed by the backend. <Link to={`/verify?id=${report.id}`}>Verify report</Link></div>}</section></div>
}
