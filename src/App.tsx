import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    // Client Information
    businessName: '',
    ownerName: '',
    contactNumber: '',
    email: '',
    facebookPage: '',

    // Plan
    plan: '999', // Default to 999 Basic

    // Business Details
    businessType: '',
    productsAndPrices: '',

    // Logo and Photos
    logoChoice: 'upload', // 'upload', 'text', 'none'
    logoFile: null as string | null,

    photoChoice: 'upload', // 'upload', 'temp'
    productPhotos: null as string | null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'logoFile' | 'productPhotos') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      try {
        const base64 = await convertFileToBase64(file)
        setFormData(prev => ({ ...prev, [fieldName]: base64 }))
      } catch (error) {
        console.error('Error converting file:', error)
        alert('Error uploading file. Please try another image.')
      }
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXQvsj0LYlAGfcQWdz9SkTwqkcL28xoj4YY15FLr7BeZ736zEbFqrnuZWIF9J69AeF/exec'

    try {
      const params = new URLSearchParams()

      // Append all simple string fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          params.append(key, value as string)
        }
      })

      params.append('timestamp', new Date().toISOString())

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: params,
        mode: 'no-cors'
      })

      setSubmitStatus({ type: 'success', message: 'Form submitted successfully! We will be in touch soon.' })
      console.log('Form Data submitted:', formData)
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus({ type: 'error', message: 'Failed to submit form. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="get-quote-page">
      <div className="get-quote-container">
        <div className="get-quote-content">
          <div className="quote-form-wrapper">
            <h2 className="form-heading">Start Your Project</h2>
            <form className="quote-form" onSubmit={handleSubmit}>

              {/* ========== SECTION 1: CLIENT INFORMATION ========== */}
              <div className="form-section-header full-width">
                <span className="section-number">1</span>
                <span className="section-title">Client Information</span>
              </div>

              {/* Business Name */}
              <div className="form-group">
                <label className="field-label">Business Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="businessName"
                  className="form-input"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Owner Name */}
              <div className="form-group">
                <label className="field-label">Owner Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="ownerName"
                  className="form-input"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Contact Number */}
              <div className="form-group">
                <label className="field-label">Contact Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="contactNumber"
                  className="form-input"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="field-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Facebook Page Link */}
              <div className="form-group full-width">
                <label className="field-label">Facebook Page Link</label>
                <input
                  type="url"
                  name="facebookPage"
                  className="form-input"
                  value={formData.facebookPage}
                  onChange={handleInputChange}
                />
              </div>


              {/* ========== SECTION 2: CHOOSE YOUR PLAN ========== */}
              <div className="form-section-header full-width">
                <span className="section-number">2</span>
                <span className="section-title">Choose Your Plan</span>
              </div>

              <div className="plan-selection-container full-width">
                <label className={`plan-card ${formData.plan === '999' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="plan"
                    value="999"
                    checked={formData.plan === '999'}
                    onChange={handleInputChange}
                    className="plan-radio"
                  />
                  <div className="plan-content">
                    <div className="plan-header">
                      <span className="plan-name">Basic Plan</span>
                      <span className="plan-price">₱999</span>
                    </div>
                    <p className="plan-subtitle">E-Menu only, messages go to Messenger</p>
                    <ul className="plan-features">
                      <li>• No editing access for client</li>
                      <li>• Spreadsheet disabled</li>
                      <li>• Order tracking disabled</li>
                      <li>• Email notification disabled</li>
                      <li>• E-Menu only → direct to Messenger</li>
                    </ul>
                  </div>
                </label>

                <label className={`plan-card ${formData.plan === '2499' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="plan"
                    value="2499"
                    checked={formData.plan === '2499'}
                    onChange={handleInputChange}
                    className="plan-radio"
                  />
                  <div className="plan-content">
                    <div className="plan-header">
                      <span className="plan-name">Advance Plan</span>
                      <span className="plan-price">₱2,499</span>
                    </div>
                    <p className="plan-subtitle">Complete system and features</p>
                    <ul className="plan-features">
                      <li>• Editable system</li>
                      <li>• Spreadsheet enabled</li>
                      <li>• Order tracking & dashboard</li>
                      <li>• Email notifications</li>
                      <li>• Complete features unlocked</li>
                    </ul>
                  </div>
                </label>
              </div>


              {/* ========== SECTION 3: BUSINESS DETAILS ========== */}
              <div className="form-section-header full-width">
                <span className="section-number">3</span>
                <span className="section-title">Business Details</span>
              </div>

              {/* Type of Business */}
              <div className="form-group full-width">
                <label className="field-label">Type of Business <span className="required">*</span></label>
                <input
                  type="text"
                  name="businessType"
                  placeholder="e.g., milk tea, burger shop, restaurant, food tray business"
                  className="form-input"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Products and Prices */}
              <div className="form-group full-width">
                <label className="field-label">List your products and prices <span className="required">*</span></label>
                <p className="field-helper">(You may also send via Messenger if not ready)</p>
                <textarea
                  name="productsAndPrices"
                  className="form-textarea"
                  value={formData.productsAndPrices}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>


              {/* ========== SECTION 4: LOGO AND PHOTOS ========== */}
              <div className="form-section-header full-width">
                <span className="section-number">4</span>
                <span className="section-title">Logo and Photos</span>
              </div>

              {/* Logo Choice */}
              <div className="form-group full-width">
                <label className="field-label">Do you already have a logo?</label>
                <div className="radio-group-vertical">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="logoChoice"
                      value="upload"
                      checked={formData.logoChoice === 'upload'}
                      onChange={handleInputChange}
                    />
                    Yes, I will upload
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="logoChoice"
                      value="text"
                      checked={formData.logoChoice === 'text'}
                      onChange={handleInputChange}
                    />
                    None, please make a simple text logo
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="logoChoice"
                      value="none"
                      checked={formData.logoChoice === 'none'}
                      onChange={handleInputChange}
                    />
                    No logo needed
                  </label>
                </div>
              </div>

              {/* Upload Logo - Conditional */}
              {formData.logoChoice === 'upload' && (
                <div className="form-group full-width">
                  <label className="field-label">Upload Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logoFile')}
                    className="file-input"
                  />
                  {formData.logoFile && <span className="file-success">Logo attached!</span>}
                </div>
              )}

              {/* Product Photos Choice */}
              <div className="form-group full-width">
                <label className="field-label">Do you have product photos?</label>
                <div className="radio-group-vertical">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="photoChoice"
                      value="upload"
                      checked={formData.photoChoice === 'upload'}
                      onChange={handleInputChange}
                    />
                    Yes, I will upload
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="photoChoice"
                      value="temp"
                      checked={formData.photoChoice === 'temp'}
                      onChange={handleInputChange}
                    />
                    Not yet, use temporary icons
                  </label>
                </div>
              </div>

              {/* Upload Photos - Conditional */}
              {formData.photoChoice === 'upload' && (
                <div className="form-group full-width">
                  <label className="field-label">Upload product photos (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple // Note: simplistic multiple support, might need array logic if strictly required but focusing on single for now as per base structure or simple concatenation
                    onChange={(e) => handleFileChange(e, 'productPhotos')}
                    className="file-input"
                  />
                  {formData.productPhotos && <span className="file-success">Photos attached!</span>}
                </div>
              )}


              {/* Submit Button */}
              <div className="form-group full-width">
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  <span className="submit-btn__text">{isSubmitting ? 'Submitting...' : 'Submit Form'}</span>
                  {!isSubmitting && <span className="submit-btn__icon"></span>}
                  <span className="submit-btn__filler"></span>
                </button>
                {submitStatus && (
                  <div className={`submit-status ${submitStatus.type}`}>
                    {submitStatus.message}
                  </div>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
