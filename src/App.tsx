import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    // Group 1: Identity
    fullName: '',
    businessName: '',
    businessType: '',
    // Group 2: Contact
    email: '',
    phone: '',
    address: '',
    // Group 3: Project
    timeline: '',
    budget: '',
    plan: '',
    sections: [] as string[],
    socialMedia: '',
    googleDrive: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const availableSections = ['Hero', 'About', 'Services', 'Gallery', 'Pricing', 'Contact', 'Blog', 'Testimonials', 'Footer', 'FAQ']
  const mandatorySections = ['Hero', 'Contact'] // Mandatory for Basic plan

  // Auto-select mandatory sections when Basic plan is chosen
  useEffect(() => {
    if (formData.plan === 'Basic') {
      setFormData(prev => {
        const newSections = [...prev.sections]
        mandatorySections.forEach(section => {
          if (!newSections.includes(section)) {
            newSections.push(section)
          }
        })
        return { ...prev, sections: newSections }
      })
    }
  }, [formData.plan])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    
    // Prevent unchecking mandatory sections on Basic plan
    if (formData.plan === 'Basic' && mandatorySections.includes(value) && !checked) {
      return
    }
    
    const currentSections = formData.sections
    if (checked) {
      if (formData.plan === 'Basic' && currentSections.length >= 6) {
        return
      }
      setFormData(prev => ({ ...prev, sections: [...prev.sections, value] }))
    } else {
      setFormData(prev => ({ ...prev, sections: prev.sections.filter(s => s !== value) }))
    }
  }

  const isSectionDisabled = (section: string) => {
    if (formData.plan !== 'Basic') return false
    // Mandatory sections are always checked but shown as "locked"
    if (mandatorySections.includes(section)) return true
    return !formData.sections.includes(section) && formData.sections.length >= 6
  }

  const isMandatory = (section: string) => {
    return formData.plan === 'Basic' && mandatorySections.includes(section)
  }

  // Calculate remaining optional slots (6 total - 2 mandatory = 4 optional choices)
  const getOptionalSectionsCount = () => {
    return formData.sections.filter(s => !mandatorySections.includes(s)).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQ_pSXDd0eBU9fErsfBRp-pNWn5Cbb7wnM254dIhyzhqYeyBe-gZZVBtGn23u1vd4/exec'

    try {
      // Use URLSearchParams for reliable data transmission to Google Apps Script
      const params = new URLSearchParams()
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.append(key, value.join(', '))
        } else {
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
          {/* Form */}
          <div className="quote-form-wrapper">
            <h2 className="form-heading">Start Your Project</h2>
            <form className="quote-form" onSubmit={handleSubmit}>
              
              {/* ========== GROUP 1: IDENTITY ========== */}
              <div className="form-section-header full-width">
                <span className="section-number">1</span>
                <span className="section-title">The Basics</span>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
                <span className="required-indicator">*</span>
              </div>

              {/* Business Name */}
              <div className="form-group">
                <input
                  type="text"
                  name="businessName"
                  placeholder="Business Name"
                  className="form-input"
                  value={formData.businessName}
                  onChange={handleInputChange}
                />
                <span className="required-indicator">*</span>
              </div>

              {/* Business Type Dropdown */}
              <div className="form-group full-width">
                <select
                  name="businessType"
                  className="form-select"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Business Type</option>
                  <option value="Physical">Physical (Brick & Mortar)</option>
                  <option value="Online">Online (E-commerce/Digital)</option>
                  <option value="Both">Both (Hybrid)</option>
                </select>
                <span className="required-indicator">*</span>
              </div>

              {/* ========== GROUP 2: CONTACT ========== */}
              <div className="form-section-header full-width">
                <span className="section-number">2</span>
                <span className="section-title">Contact Information</span>
              </div>

              {/* Email */}
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <span className="required-indicator">*</span>
              </div>

              {/* Phone */}
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                <span className="required-indicator">*</span>
              </div>

              {/* Address (Optional) */}
              <div className="form-group full-width">
                <textarea
                  name="address"
                  placeholder="Address"
                  className="form-textarea"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                />
                <span className="required-indicator">*</span>
              </div>

              {/* ========== GROUP 3: PROJECT ========== */}
              <div className="form-section-header full-width">
                <span className="section-number">3</span>
                <span className="section-title">Project Details</span>
              </div>

              {/* Timeline */}
              <div className="form-group">
                <select
                  name="timeline"
                  className="form-select"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Project Timeline</option>
                  <option value="urgent">Urgent (1-2 weeks)</option>
                  <option value="normal">Normal (1-2 months)</option>
                  <option value="flexible">Flexible (3+ months)</option>
                </select>
                <span className="required-indicator">*</span>
              </div>

              {/* Budget */}
              <div className="form-group">
                <select
                  name="budget"
                  className="form-select"
                  value={formData.budget}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Budget Range</option>
                  <option value="5k-10k">₱5,000 - ₱10,000</option>
                  <option value="10k-25k">₱10,000 - ₱25,000</option>
                  <option value="25k-50k">₱25,000 - ₱50,000</option>
                  <option value="50k+">₱50,000+</option>
                </select>
                <span className="required-indicator">*</span>
              </div>

              {/* Plan Selection Dropdown */}
              <div className="form-group full-width">
                <select
                  name="plan"
                  className="form-select"
                  value={formData.plan}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Plan</option>
                  <option value="Basic">Basic (4-6 sections max)</option>
                  <option value="Pro">Pro (7-12+ sections)</option>
                </select>
                <span className="required-indicator">*</span>
              </div>

              {/* Page Sections */}
              <div className="form-group full-width">
                <div className="sections-label">
                  Page Sections {formData.plan === 'Basic' && `(${getOptionalSectionsCount()}/4 optional + 2 mandatory)`}
                  {formData.plan === 'Pro' && `(${formData.sections.length} selected)`}
                </div>
                <div className="sections-grid">
                  {availableSections.map(section => (
                    <label 
                      key={section} 
                      className={`section-checkbox ${isSectionDisabled(section) && !isMandatory(section) ? 'disabled' : ''} ${formData.sections.includes(section) ? 'checked' : ''} ${isMandatory(section) ? 'mandatory' : ''}`}
                    >
                      <input
                        type="checkbox"
                        value={section}
                        checked={formData.sections.includes(section)}
                        onChange={handleCheckboxChange}
                        disabled={isSectionDisabled(section)}
                      />
                      <span className="checkmark"></span>
                      {section}
                      {isMandatory(section) && <span className="mandatory-badge">Required</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="form-group">
                <input
                  type="text"
                  name="socialMedia"
                  placeholder="Social Media Links"
                  className="form-input"
                  value={formData.socialMedia}
                  onChange={handleInputChange}
                />
                <span className="required-indicator">*</span>
              </div>

              {/* Google Drive Link */}
              <div className="form-group">
                <input
                  type="url"
                  name="googleDrive"
                  placeholder="Google Drive Link for Assets"
                  className="form-input"
                  value={formData.googleDrive}
                  onChange={handleInputChange}
                />
                <span className="required-indicator">*</span>
              </div>

              {/* Submit Button */}
              <div className="form-group full-width">
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  <span className="submit-btn__text">{isSubmitting ? 'Submitting...' : 'Submit Your Project'}</span>
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
