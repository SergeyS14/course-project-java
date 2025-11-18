export const usePhoneMask = () => {
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    
    let formatted = digits.startsWith('8') ? '7' + digits.slice(1) : digits
    
    if (formatted && !formatted.startsWith('7')) {
      formatted = '7' + formatted
    }
    
    formatted = formatted.slice(0, 11)
    
    if (formatted.length === 0) return ''
    if (formatted.length <= 1) return `+${formatted}`
    if (formatted.length <= 4) return `+${formatted.slice(0, 1)} (${formatted.slice(1)}`
    if (formatted.length <= 7) return `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4)}`
    if (formatted.length <= 9) return `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7)}`
    return `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7, 9)}-${formatted.slice(9, 11)}`
  }
  
  const unformatPhone = (value: string): string => {
    return value.replace(/\D/g, '')
  }
  
  return { formatPhone, unformatPhone }
}

export const usePostalCodeMask = () => {
  const formatPostalCode = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    return digits.slice(0, 6)
  }
  
  return { formatPostalCode }
}

