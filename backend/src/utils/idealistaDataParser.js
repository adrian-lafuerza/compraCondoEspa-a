/**
 * Parser para procesar datos de Idealista desde archivos XML/JSON del FTP
 * Convierte los datos al formato esperado por el frontend
 */
class IdealistaDataParser {
    constructor() {
        this.supportedFormats = ['xml', 'json'];
    }

    /**
     * Normaliza una propiedad individual al formato esperado
     */
    normalizeProperty(rawProperty) {
        try {
            // rawProperty es el elemento <ad> completo
            // Los datos están en diferentes niveles según la estructura XML:
            // - ID: rawProperty.id
            // - Precios: rawProperty.prices.byOperation.SALE.price
            // - Referencia: rawProperty.externalReference
            // - Características: rawProperty.property.housing
            // - Dirección: rawProperty.property.address
            
            // Acceder a los datos según la estructura XML real
            const propertyData = Array.isArray(rawProperty.property) ? rawProperty.property[0] : rawProperty.property;
            const housingData = Array.isArray(propertyData?.housing) ? propertyData.housing[0] : propertyData?.housing;
            const addressData = Array.isArray(propertyData?.address) ? propertyData.address[0] : propertyData?.address;
            const pricesData = Array.isArray(rawProperty.prices) ? rawProperty.prices[0] : rawProperty.prices;
            
            // Estructura ajustada para coincidir exactamente con lo que espera el frontend
            const normalized = {
                // Información básica
                propertyId: this.extractPropertyId(rawProperty),
                reference: this.extractExternalReference(rawProperty),
                
                // Estructura de operación que espera el frontend
                operation: {
                    price: this.extractPrice(rawProperty),
                    currency: this.extractCurrency(rawProperty) || 'EUR',
                    type: this.extractOperation(rawProperty)
                },
                
                // Estructura de dirección que espera el frontend
                address: {
                    streetName: this.extractStreetName(rawProperty),
                    city: this.extractCity(rawProperty),
                    province: this.extractProvince(rawProperty),
                    postalCode: this.extractPostalCode(rawProperty),
                    fullAddress: this.extractFullAddress(rawProperty)
                },
                
                // Estructura de características que espera el frontend
                features: {
                    rooms: this.extractRooms(rawProperty),
                    bathroomNumber: this.extractBathrooms(rawProperty),
                    areaConstructed: this.extractSize(rawProperty),
                    usableArea: this.extractUsableArea(rawProperty),
                    floor: this.extractFloor(rawProperty)
                },
                
                // Descripciones como array que espera el frontend
                descriptions: this.extractDescriptionsArray(rawProperty),
                
                // Multimedia
                images: this.extractImages(rawProperty),
                
                // Información adicional mantenida para compatibilidad
                title: this.extractTitle(rawProperty),
                propertyType: this.extractPropertyType(rawProperty),
                typology: this.extractTypology(rawProperty),
                constructionYear: this.extractConstructionYear(rawProperty),
                energyRating: this.extractEnergyRating(rawProperty),
                amenities: this.extractAmenities(rawProperty),
                status: this.extractStatus(rawProperty) || 'active',
                
                // Fechas
                publishedDate: this.extractPublishedDate(rawProperty),
                modificationDate: this.extractModificationDate(rawProperty),
                
                // Ubicación completa para compatibilidad
                location: this.extractLocation(rawProperty),
                coordinates: this.extractCoordinates(rawProperty)
            };

            return normalized;
        } catch (error) {
            console.error('Error normalizando propiedad:', error);
            return null;
        }
    }

    /**
     * Helper para extraer valores que pueden estar en arrays (debido a explicitArray: true)
     */
    extractArrayValue(value) {
        if (Array.isArray(value)) {
            return value[0] || null;
        }
        return value || null;
    }

    /**
     * Extrae el ID de la propiedad
     */
    extractPropertyId(property) {
        return this.extractArrayValue(property.id) || 
               this.extractArrayValue(property.propertyId) || 
               this.extractArrayValue(property.propertyCode) || 
               this.extractArrayValue(property.codigo) || 
               this.extractArrayValue(property.reference) ||
               this.extractArrayValue(property.referencia) ||
               `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Extrae el título de la propiedad
     */
    extractTitle(property) {
        return property.title || 
               property.titulo || 
               property.name || 
               property.nombre || 
               property.headline ||
               `${this.extractPropertyType(property)} en ${this.extractLocation(property)?.city || 'Madrid'}`;
    }

    /**
     * Extrae el precio
     */
    extractPrice(rawProperty) {
        // Estructura XML de Idealista: <ad><prices><byoperation><sale><price>1230000</price></sale></byoperation></prices>
        let price = null;
        
        // Acceder a los precios desde el elemento <ad>
        const pricesData = Array.isArray(rawProperty.prices) ? rawProperty.prices[0] : rawProperty.prices;
        
        if (pricesData && pricesData.byoperation) {
            const byOperation = Array.isArray(pricesData.byoperation) ? pricesData.byoperation[0] : pricesData.byoperation;
            
            // Probar tanto sale como SALE (por si acaso)
            if (byOperation.sale) {
                const saleData = Array.isArray(byOperation.sale) ? byOperation.sale[0] : byOperation.sale;
                price = Array.isArray(saleData.price) ? saleData.price[0] : saleData.price;
            } else if (byOperation.SALE) {
                const saleData = Array.isArray(byOperation.SALE) ? byOperation.SALE[0] : byOperation.SALE;
                price = Array.isArray(saleData.price) ? saleData.price[0] : saleData.price;
            }
        }
        
        // Fallback para otras estructuras (incluyendo camelCase por compatibilidad)
        if (!price && pricesData && pricesData.byOperation) {
            const byOperation = Array.isArray(pricesData.byOperation) ? pricesData.byOperation[0] : pricesData.byOperation;
            
            if (byOperation.sale) {
                const saleData = Array.isArray(byOperation.sale) ? byOperation.sale[0] : byOperation.sale;
                price = Array.isArray(saleData.price) ? saleData.price[0] : saleData.price;
            } else if (byOperation.SALE) {
                const saleData = Array.isArray(byOperation.SALE) ? byOperation.SALE[0] : byOperation.SALE;
                price = Array.isArray(saleData.price) ? saleData.price[0] : saleData.price;
            }
        }
        
        // Fallback para otras estructuras
        if (!price) {
            price = rawProperty.price || 
                   rawProperty.precio || 
                   rawProperty.priceInfo?.price ||
                   rawProperty.amount ||
                   rawProperty.valor;
        }
        
        return price ? parseInt(price.toString().replace(/[^\d]/g, '')) : 0;
    }

    /**
     * Extrae la moneda
     */
    extractCurrency(property) {
        return property.currency || 
               property.moneda || 
               property.priceInfo?.currency ||
               'EUR';
    }

    /**
     * Extrae el tamaño en m²
     */
    extractSize(rawProperty) {
        // Estructura XML de Idealista: <ad><property><housing><propertyArea>159</propertyArea></housing></property>
        const propertyData = Array.isArray(rawProperty.property) ? rawProperty.property[0] : rawProperty.property;
        const housing = Array.isArray(propertyData?.housing) ? propertyData.housing[0] : propertyData?.housing || {};
        
        let size = this.extractArrayValue(housing.propertyArea) ||
                  this.extractArrayValue(housing.propertyarea) ||
                  this.extractArrayValue(rawProperty.size) || 
                  this.extractArrayValue(rawProperty.superficie) || 
                  this.extractArrayValue(rawProperty.area) || 
                  this.extractArrayValue(rawProperty.squareMeters) ||
                  this.extractArrayValue(rawProperty.m2);
        
        return size ? parseInt(size.toString().replace(/[^\d]/g, '')) : 0;
    }

    /**
     * Extrae el número de habitaciones
     */
    extractRooms(rawProperty) {
        // Estructura XML de Idealista: <property><housing><roomNumber>
        const propertyData = Array.isArray(rawProperty.property) ? rawProperty.property[0] : rawProperty.property;
        const housing = Array.isArray(propertyData?.housing) ? propertyData.housing[0] : propertyData?.housing || {};
        
        const rooms = this.extractArrayValue(housing.roomNumber) ||
                     this.extractArrayValue(housing.roomnumber) ||
                     this.extractArrayValue(housing.bedroomNumber) ||
                     this.extractArrayValue(housing.bedromnumber) ||
                     this.extractArrayValue(rawProperty.rooms) || 
                     this.extractArrayValue(rawProperty.habitaciones) || 
                     this.extractArrayValue(rawProperty.bedrooms) || 
                     this.extractArrayValue(rawProperty.dormitorios) ||
                     this.extractArrayValue(rawProperty.numRooms);
        return rooms ? parseInt(rooms) : 0;
    }

    /**
     * Extrae el número de baños
     */
    extractBathrooms(rawProperty) {
        // Estructura XML de Idealista: <property><housing><bathNumber>
        const propertyData = Array.isArray(rawProperty.property) ? rawProperty.property[0] : rawProperty.property;
        const housing = Array.isArray(propertyData?.housing) ? propertyData.housing[0] : propertyData?.housing || {};
        
        const bathrooms = this.extractArrayValue(housing.bathNumber) ||
                         this.extractArrayValue(housing.bathnumber) ||
                         this.extractArrayValue(rawProperty.bathrooms) || 
                         this.extractArrayValue(rawProperty.banos) || 
                         this.extractArrayValue(rawProperty.numBathrooms) ||
                         this.extractArrayValue(rawProperty.aseos);
        
        return bathrooms ? parseInt(bathrooms) : 0;
    }

    /**
     * Extrae la información de ubicación
     */
    extractLocation(rawProperty) {
        // Estructura XML de Idealista: <property><address> y <property><location>
        const propertyData = Array.isArray(rawProperty.property) ? rawProperty.property[0] : rawProperty.property;
        const address = Array.isArray(propertyData?.address) ? propertyData.address[0] : propertyData?.address || {};
        const location = Array.isArray(propertyData?.location) ? propertyData.location[0] : propertyData?.location || {};
        
        return {
            address: address.streetName || 
                    address.streetname || 
                    location.address || 
                    location.direccion || 
                    rawProperty.address ||
                    rawProperty.direccion ||
                    'Dirección no disponible',
            city: location.city || 
                 location.ciudad || 
                 rawProperty.city ||
                 rawProperty.ciudad ||
                 'Madrid',
            province: location.province || 
                     location.provincia || 
                     rawProperty.province ||
                     rawProperty.provincia ||
                     'Madrid',
            postalCode: address.postalCode || 
                       address.postalcode ||
                       location.postalCode || 
                       location.codigoPostal || 
                       rawProperty.postalCode ||
                       rawProperty.codigoPostal ||
                       '',
            coordinates: {
                latitude: parseFloat(address.coordinates?.latitude || location.latitude || location.lat || rawProperty.latitude || rawProperty.lat || 0),
                longitude: parseFloat(address.coordinates?.longitude || location.longitude || location.lng || rawProperty.longitude || rawProperty.lng || 0)
            }
        };
    }

    /**
     * Extrae la descripción
     */
    extractDescription(property) {
        // Estructura XML de Idealista: <comments><adComments><propertyComment>
        let description = '';
        
        if (property.comments) {
            let comments = [];
            
            // Con explicitArray: true
            if (Array.isArray(property.comments)) {
                property.comments.forEach(commentObj => {
                    if (commentObj.adcomments) {
                        comments = comments.concat(commentObj.adcomments);
                    }
                });
            } else if (property.comments.adcomments) {
                comments = Array.isArray(property.comments.adcomments) 
                    ? property.comments.adcomments 
                    : [property.comments.adcomments];
            }
            
            // Buscar comentario en español (language: 0) o inglés (language: 1)
            const spanishComment = comments.find(c => c.language === '0' || c.language === 0);
            const englishComment = comments.find(c => c.language === '1' || c.language === 1);
            
            description = spanishComment?.propertycomment && spanishComment.propertycomment[0] || 
                         englishComment?.propertycomment && englishComment.propertycomment[0] ||
                         comments[0]?.propertycomment && comments[0].propertycomment[0];
        }
        
        return description ||
               property.description || 
               property.descripcion || 
               property.details || 
               property.detalles ||
               property.comment ||
               property.comentario ||
               'Descripción no disponible';
    }

    /**
     * Extrae las características/features
     */
    extractFeatures(property) {
        let features = [];
        
        if (property.features) {
            features = Array.isArray(property.features) ? property.features : [property.features];
        } else if (property.caracteristicas) {
            features = Array.isArray(property.caracteristicas) ? property.caracteristicas : [property.caracteristicas];
        } else if (property.amenities) {
            features = Array.isArray(property.amenities) ? property.amenities : [property.amenities];
        }

        // Agregar características basadas en otros campos
        if (property.elevator || property.ascensor) features.push('Ascensor');
        if (property.parking || property.garaje) features.push('Parking');
        if (property.terrace || property.terraza) features.push('Terraza');
        if (property.balcony || property.balcon) features.push('Balcón');
        if (property.garden || property.jardin) features.push('Jardín');
        if (property.pool || property.piscina) features.push('Piscina');
        if (property.airConditioning || property.aireAcondicionado) features.push('Aire acondicionado');
        if (property.heating || property.calefaccion) features.push('Calefacción');

        return features.filter(f => f && f.trim() !== '');
    }

    /**
     * Extrae las imágenes
     */
    extractImages(property) {
        let images = [];
        
        // Buscar en la estructura de Idealista: multimedias.pictures
        if (property.multimedias) {
            let pictures = [];
            
            // Con explicitArray: true, multimedias será un array
            if (Array.isArray(property.multimedias)) {
                property.multimedias.forEach(multimedia => {
                    if (multimedia.pictures) {
                        pictures = pictures.concat(multimedia.pictures);
                    }
                });
            } else if (property.multimedias.pictures) {
                pictures = Array.isArray(property.multimedias.pictures) 
                    ? property.multimedias.pictures 
                    : [property.multimedias.pictures];
            }
            
            images = pictures.map((picture, index) => {
                // Extraer valores de arrays si es necesario
                const url = this.extractArrayValue(picture.multimediapath) || 
                           this.extractArrayValue(picture.multimediaPath) || 
                           this.extractArrayValue(picture.url);
                           
                if (url) {
                    return {
                        url: url,
                        alt: `Imagen ${index + 1} de la propiedad`,
                        id: this.extractArrayValue(picture.id) || null,
                        position: this.extractArrayValue(picture.position) || index + 1,
                        tag: this.extractArrayValue(picture.multimediatag) || 
                             this.extractArrayValue(picture.multimediaTag) || null
                    };
                }
                return null;
            }).filter(img => img !== null);
        }
        
        // Fallback para otras estructuras
        if (images.length === 0) {
            if (property.images) {
                images = Array.isArray(property.images) ? property.images : [property.images];
            } else if (property.imagenes) {
                images = Array.isArray(property.imagenes) ? property.imagenes : [property.imagenes];
            } else if (property.photos) {
                images = Array.isArray(property.photos) ? property.photos : [property.photos];
            } else if (property.fotos) {
                images = Array.isArray(property.fotos) ? property.fotos : [property.fotos];
            }

            // Normalizar URLs de imágenes para fallback
            images = images.map((img, index) => {
                if (typeof img === 'string') {
                    return { url: img, alt: `Imagen ${index + 1} de la propiedad` };
                } else if (img && img.url) {
                    return { url: img.url, alt: img.alt || `Imagen ${index + 1} de la propiedad` };
                }
                return null;
            }).filter(img => img !== null);
        }

        return images;
    }

    /**
     * Extrae el tipo de propiedad
     */
    extractPropertyType(property) {
        const type = property.propertyType || 
                    property.tipo || 
                    property.type ||
                    property.category ||
                    property.categoria;
        
        // Mapear tipos comunes
        const typeMap = {
            'piso': 'homes',
            'apartamento': 'homes',
            'casa': 'homes',
            'chalet': 'homes',
            'duplex': 'homes',
            'atico': 'homes',
            'estudio': 'homes',
            'loft': 'homes',
            'local': 'premises',
            'oficina': 'offices',
            'garaje': 'garages',
            'trastero': 'storageRooms'
        };

        return typeMap[type?.toLowerCase()] || 'homes';
    }

    /**
     * Extrae el tipo de operación
     */
    extractOperation(property) {
        const operation = property.operation || 
                         property.operacion || 
                         property.transactionType ||
                         property.tipoTransaccion;
        
        // Mapear operaciones comunes
        const operationMap = {
            'venta': 'sale',
            'alquiler': 'rent',
            'sale': 'sale',
            'rent': 'rent'
        };

        return operationMap[operation?.toLowerCase()] || 'sale';
    }

    /**
     * Extrae la calificación energética
     */
    extractEnergyRating(property) {
        return property.energyRating || 
               property.calificacionEnergetica || 
               property.energyCertificate ||
               property.certificadoEnergetico ||
               'N/A';
    }

    /**
     * Extrae la fecha de publicación
     */
    extractPublishedDate(property) {
        const date = property.publishedDate || 
                    property.fechaPublicacion || 
                    property.createdDate ||
                    property.fechaCreacion ||
                    property.date ||
                    property.fecha;
        
        if (date) {
            return new Date(date).toISOString().split('T')[0];
        }
        
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Extrae información de contacto
     */
    extractContact(property) {
        const contact = property.contact || property.contacto || {};
        
        return {
            phone: contact.phone || 
                  contact.telefono || 
                  property.phone ||
                  property.telefono ||
                  null,
            email: contact.email || 
                  contact.correo || 
                  property.email ||
                  property.correo ||
                  null,
            name: contact.name || 
                 contact.nombre || 
                 property.contactName ||
                 property.nombreContacto ||
                 null
        };
    }

    /**
     * Extrae la URL de la propiedad
     */
    extractUrl(property) {
        return property.url || 
               property.link || 
               property.enlace ||
               null;
    }

    /**
     * Extrae el estado de la propiedad
     */
    extractStatus(property) {
        const status = property.status || 
                      property.estado || 
                      property.state;
        
        // Solo incluir propiedades activas según el mensaje
        return status === 'active' || status === 'activo' || !status ? 'active' : status;
    }

    /**
     * Procesa un array de propiedades
     */
    parseProperties(rawData) {
        try {
            let properties = [];
            
            // Detectar estructura del archivo
        if (rawData.ads && rawData.ads.ad) {
            // Estructura XML de Idealista: <ads><ad>...</ad></ads>
            properties = Array.isArray(rawData.ads.ad) ? rawData.ads.ad : [rawData.ads.ad];
        } else if (rawData.ads && rawData.ads[0] && rawData.ads[0].ad) {
            // Estructura XML de Idealista con explicitArray: true (fallback)
            properties = rawData.ads[0].ad;
        } else if (rawData.properties) {
            properties = Array.isArray(rawData.properties) ? rawData.properties : [rawData.properties];
        } else if (rawData.inmuebles) {
            properties = Array.isArray(rawData.inmuebles) ? rawData.inmuebles : [rawData.inmuebles];
        } else if (Array.isArray(rawData)) {
            properties = rawData;
        } else if (rawData.property) {
            properties = Array.isArray(rawData.property) ? rawData.property : [rawData.property];
        } else if (rawData.inmueble) {
            properties = Array.isArray(rawData.inmueble) ? rawData.inmueble : [rawData.inmueble];
        }

            // Normalizar cada propiedad
            const normalizedProperties = properties
                .map(prop => this.normalizeProperty(prop))
                .filter(prop => prop !== null); // Filtrar solo propiedades válidas

            return {
                properties: normalizedProperties,
                total: normalizedProperties.length,
                totalPages: Math.ceil(normalizedProperties.length / 50),
                actualPage: 1,
                itemsPerPage: 50,
                lastUpdated: new Date().toISOString(),
                source: 'ftp'
            };

        } catch (error) {
            console.error('Error procesando propiedades:', error);
            throw error;
        }
    }

    /**
     * Aplica filtros a las propiedades
     */
    applyFilters(data, filters = {}) {
        if (!data.properties || !Array.isArray(data.properties)) {
            return data;
        }

        let filteredProperties = [...data.properties];

        // Filtro por tipo de propiedad
        if (filters.propertyType) {
            filteredProperties = filteredProperties.filter(prop => 
                prop.propertyType === filters.propertyType
            );
        }

        // Filtro por operación
        if (filters.operation) {
            filteredProperties = filteredProperties.filter(prop => 
                prop.operation?.type === filters.operation
            );
        }

        // Filtro por precio mínimo
        if (filters.minPrice) {
            filteredProperties = filteredProperties.filter(prop => 
                prop.price >= parseInt(filters.minPrice)
            );
        }

        // Filtro por precio máximo
        if (filters.maxPrice) {
            filteredProperties = filteredProperties.filter(prop => 
                prop.price <= parseInt(filters.maxPrice)
            );
        }

        // Filtro por ciudad
        if (filters.city) {
            filteredProperties = filteredProperties.filter(prop => 
                prop.location.city.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        // Paginación
        const page = parseInt(filters.page) || 1;
        const size = parseInt(filters.size) || 50;
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;

        const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

        return {
            properties: paginatedProperties,
            total: filteredProperties.length,
            totalPages: Math.ceil(filteredProperties.length / size),
            actualPage: page,
            itemsPerPage: size,
            lastUpdated: data.lastUpdated,
            source: data.source
        };
    }

    // ==================== MÉTODOS DE EXTRACCIÓN ADICIONALES ====================

    /**
     * Extrae la referencia externa
     */
    extractExternalReference(property) {
        return this.extractArrayValue(property.externalreference) || 
               this.extractArrayValue(property.externalReference) || 
               this.extractArrayValue(property.referencia) ||
               this.extractArrayValue(property.reference) ||
               null;
    }

    /**
     * Extrae el scope/ámbito
     */
    extractScope(property) {
        return property.scope ? parseInt(property.scope) : null;
    }

    /**
     * Extrae el área útil
     */
    extractUsableArea(property) {
        const housing = Array.isArray(property.housing) ? property.housing[0] : property.housing || {};
        const usableArea = housing.usablearea ||
                          housing.usableArea ||
                          property.usableArea ||
                          property.areaUtil;
        return usableArea ? parseInt(usableArea) : null;
    }

    /**
     * Extrae el número de dormitorios
     */
    extractBedrooms(property) {
        const bedrooms = property.housing?.bedromnumber ||
                        property.housing?.bedroomNumber ||
                        property.bedrooms ||
                        property.dormitorios;
        return bedrooms ? parseInt(bedrooms) : null;
    }

    /**
     * Extrae el piso/planta
     */
    extractFloor(property) {
        const address = Array.isArray(property.address) ? property.address[0] : property.address || {};
        const myaddress = Array.isArray(property.myaddress) ? property.myaddress[0] : property.myaddress || {};
        
        return address.floornumber ||
               address.floorNumber ||
               myaddress.floornumber ||
               myaddress.floorNumber ||
               property.floor ||
               property.planta ||
               null;
    }

    /**
     * Extrae las coordenadas
     */
    extractCoordinates(property) {
        const address = Array.isArray(property.address) ? property.address[0] : property.address || {};
        const myaddress = Array.isArray(property.myaddress) ? property.myaddress[0] : property.myaddress || {};
        
        const coords = address.coordinates ||
                      myaddress.coordinates ||
                      property.coordinates;
        
        if (coords) {
            return {
                latitude: parseFloat(coords.latitude) || null,
                longitude: parseFloat(coords.longitude) || null
            };
        }
        return null;
    }

    /**
     * Extrae la dirección completa
     */
    extractAddress(property) {
        const address = Array.isArray(property.address) ? property.address[0] : property.address || {};
        const myaddress = Array.isArray(property.myaddress) ? property.myaddress[0] : property.myaddress || {};
        const myAddress = Array.isArray(property.myAddress) ? property.myAddress[0] : property.myAddress || {};
        

        
        // Extraer streetName desde diferentes ubicaciones posibles
        let streetName = '';
        if (address.streetName) {
            streetName = this.extractArrayValue(address.streetName);
        } else if (address.streetname) {
            streetName = this.extractArrayValue(address.streetname);
        } else if (myaddress.streetName) {
            streetName = this.extractArrayValue(myaddress.streetName);
        } else if (myaddress.streetname) {
            streetName = this.extractArrayValue(myaddress.streetname);
        } else if (myAddress.street && myAddress.street.name) {
            streetName = this.extractArrayValue(myAddress.street.name);
        }
        
        // Extraer postalCode desde diferentes ubicaciones posibles
        let postalCode = '';
        if (address.postalCode) {
            postalCode = this.extractArrayValue(address.postalCode);
        } else if (address.postalcode) {
            postalCode = this.extractArrayValue(address.postalcode);
        } else if (myaddress.postalCode) {
            postalCode = this.extractArrayValue(myaddress.postalCode);
        } else if (myaddress.postalcode) {
            postalCode = this.extractArrayValue(myaddress.postalcode);
        } else if (myAddress.postalCode) {
            postalCode = this.extractArrayValue(myAddress.postalCode);
        }
        
        return {
            streetName: streetName || '',
            streetNumber: this.extractArrayValue(address.streetNumber) || this.extractArrayValue(address.streetnumber) || this.extractArrayValue(myaddress.streetNumber) || this.extractArrayValue(myaddress.streetnumber) || this.extractArrayValue(myAddress.street?.number) || '',
            streetType: this.extractArrayValue(address.streetTypeId) || this.extractArrayValue(address.streettypeid) || this.extractArrayValue(myaddress.streetTypeId) || this.extractArrayValue(myaddress.streettypeid) || this.extractArrayValue(myAddress.street?.typeId) || '',
            postalCode: postalCode || '',
            floor: this.extractArrayValue(address.floorNumber) || this.extractArrayValue(address.floornumber) || this.extractArrayValue(myaddress.floorNumber) || this.extractArrayValue(myaddress.floornumber) || this.extractArrayValue(myAddress.floorNumber) || '',
            door: this.extractArrayValue(address.door) || this.extractArrayValue(myaddress.door) || '',
            block: this.extractArrayValue(address.block) || this.extractArrayValue(myaddress.block) || '',
            stairs: this.extractArrayValue(address.stairs) || this.extractArrayValue(myaddress.stairs) || '',
            buildingName: this.extractArrayValue(address.buildingName) || this.extractArrayValue(address.buildingname) || this.extractArrayValue(myaddress.buildingName) || this.extractArrayValue(myaddress.buildingname) || '',
            isTopFloor: address.isInTopFloor === true || address.isintopfloor === true || myaddress.isInTopFloor === true || myaddress.isintopfloor === true || false
        };
    }

    /**
     * Extrae las amenidades de la vivienda
     */
    extractAmenities(property) {
        const housing = Array.isArray(property.housing) ? property.housing[0] : property.housing || {};
        const amenities = {};

        // Características booleanas
        amenities.hasBoxRoom = housing.hasboxroom === 'true' || housing.hasBoxRoom === true;
        amenities.hasTerrace = housing.hasterrace === 'true' || housing.hasTerrace === true;
        amenities.hasWardrobe = housing.haswardrobe === 'true' || housing.hasWardrobe === true;
        amenities.hasAirConditioning = housing.hasairconditioning === 'true' || housing.hasAirConditioning === true;
        amenities.hasGarden = housing.hasgarden === 'true' || housing.hasGarden === true;
        amenities.hasSwimmingPool = housing.hasswimmingpool === 'true' || housing.hasSwimmingPool === true;
        amenities.hasLift = housing.haslift === 'true' || housing.hasLift === true;
        amenities.hasBalcony = housing.hasbalcony === 'true' || housing.hasBalcony === true;
        amenities.hasChimney = housing.haschimney === 'true' || housing.hasChimney === true;
        amenities.arePetsAllowed = housing.arepetsallowed === 'true' || housing.arePetsAllowed === true;
        amenities.isPenthouse = housing.ispenthouse === 'true' || housing.IsPenthouse === true;
        amenities.isDuplex = housing.isduplex === 'true' || housing.IsDuplex === true;
        amenities.isStudio = housing.isstudio === 'true' || housing.IsStudio === true;
        amenities.hasInteriorAccessibility = housing.hasinterioraccessibility === 'true' || housing.hasInteriorAccessibility === true;
        amenities.hasExteriorAccessibility = housing.hasexterioraccessibility === 'true' || housing.hasExteriorAccessibility === true;

        // Información numérica
        amenities.orientations = housing.orientations ? parseInt(housing.orientations) : null;
        amenities.heatingType = housing.heatingtype ? parseInt(housing.heatingtype) : null;
        amenities.propertyLocation = housing.propertylocation ? parseInt(housing.propertyLocation) : null;

        // Parking
        const parking = housing.parkingspace || housing.parkingSpace || {};
        amenities.parking = {
            hasParkingSpace: parking.hasparkingspace === 'true' || parking.hasParkingSpace === true,
            isIncludedInPrice: parking.isincludedinprice === 'true' || parking.isIncludedInPrice === true,
            parkingSpacePrice: parking.parkingspaceprice || parking.parkingSpacePrice || null,
            capacity: housing.parkingspacecapacity || housing.parkingSpaceCapacity || null,
            area: housing.parkingspacearea || housing.parkingSpaceArea || null
        };

        return amenities;
    }

    /**
     * Extrae el conteo de imágenes
     */
    extractImageCount(property) {
        const count = property.multimedias?.countpictures || 
                     property.multimedias?.CountPictures ||
                     property.imageCount;
        return count ? parseInt(count) : 0;
    }

    /**
     * Extrae la tipología
     */
    extractTypology(property) {
        return property.typology ? parseInt(property.typology) : null;
    }

    /**
     * Extrae el tipo de construcción
     */
    extractBuiltType(property) {
        const housing = Array.isArray(property.housing) ? property.housing[0] : property.housing || {};
        return housing.builttype ||
               housing.builtType ||
               null;
    }

    /**
     * Extrae el año de construcción
     */
    extractConstructionYear(property) {
        const housing = Array.isArray(property.housing) ? property.housing[0] : property.housing || {};
        const year = housing.constructionyear ||
                    housing.constructionYear ||
                    property.constructionYear ||
                    property.anoConstruction;
        return year ? parseInt(year) : null;
    }

    /**
     * Extrae los gastos de comunidad
     */
    extractCommunityCosts(property) {
        const costs = property.communitycosts ||
                     property.communityCosts ||
                     property.communityCosts ||
                     property.gastosComunitarios;
        return costs ? parseInt(costs) : null;
    }

    /**
     * Extrae el depósito
     */
    extractDeposit(property) {
        const deposit = property.deposit ||
                       property.deposit ||
                       property.fianza;
        return deposit ? parseInt(deposit) : null;
    }

    /**
     * Extrae las emisiones energéticas
     */
    extractEnergyEmissions(property) {
        const emissions = property.energy?.emissions || {};
        return {
            certification: emissions.certification ? parseInt(emissions.certification) : null,
            value: emissions.value || null
        };
    }

    /**
     * Extrae información del publicador
     */
    extractPublisher(property) {
        const publisher = property.publisher || {};
        const contact = publisher.contact || {};
        const commercialData = publisher.commercialdata || publisher.commercialData || {};

        return {
            contactId: contact.id || null,
            name: contact.name ? `${contact.name.name || ''} ${contact.name.surnames || ''}`.trim() : '',
            email: contact.email?.address || '',
            isEmailValid: contact.email?.isvalid === 'true' || contact.email?.isValid === true,
            phones: {
                primary: contact.phones?.primary?.number || '',
                secondary: contact.phones?.secondary?.number || '',
                redirection: contact.phones?.redirection?.number || '',
                prefix: contact.phones?.primary?.prefix || ''
            },
            commercialId: commercialData.id || null,
            commercialName: commercialData.commercialname || commercialData.commercialName || ''
        };
    }

    /**
     * Extrae la fecha de modificación
     */
    extractModificationDate(property) {
        const timestamp = property.modification;
        return timestamp ? new Date(parseInt(timestamp)) : null;
    }

    /**
     * Extrae la fecha de creación
     */
    extractCreationDate(property) {
        const timestamp = property.creation;
        return timestamp ? new Date(parseInt(timestamp)) : null;
    }

    /**
     * Extrae los servicios
     */
    extractServices(property) {
        const services = property.services || {};
        return {
            hasPicsAndPlan: services.haspicsandplan === 'true' || services.hasPicsAndPlan === true
        };
    }

    /**
     * Extrae información de destacado visual
     */
    extractVisualHighlight(property) {
        const highlight = property.services?.visualhighlight || property.services?.visualHighlight || {};
        return {
            isUrgentVisualHighlight: highlight.isurgentvisualhighlight === 'true' || highlight.isUrgentVisualHighlight === true,
            isVisualHighlight: highlight.isvisualhighlight === 'true' || highlight.isVisualHighlight === true
        };
    }

    /**
     * Extrae información extra
     */
    extractExtras(property) {
        const extras = property.extras || {};
        const result = {};

        // Convertir todos los extras a un objeto más manejable
        Object.keys(extras).forEach(key => {
            const value = extras[key];
            if (value !== undefined && value !== null && value !== '') {
                result[key.toLowerCase()] = value;
            }
        });

        return result;
    }

    /**
     * Extrae el nombre de la calle específicamente
     */
    extractStreetName(property) {
        const location = this.extractLocation(property);
        return location.address || location.street || 'Dirección no disponible';
    }

    /**
     * Extrae la ciudad específicamente
     */
    extractCity(property) {
        const location = this.extractLocation(property);
        return location.city || 'Ciudad no disponible';
    }

    /**
     * Extrae la provincia específicamente
     */
    extractProvince(property) {
        const location = this.extractLocation(property);
        return location.province || location.region || 'Provincia no disponible';
    }

    /**
     * Extrae el código postal específicamente
     */
    extractPostalCode(property) {
        const location = this.extractLocation(property);
        return location.postalCode || location.zipCode || null;
    }

    /**
     * Extrae la dirección completa
     */
    extractFullAddress(property) {
        const location = this.extractLocation(property);
        const parts = [
            location.address || location.street,
            location.city,
            location.province || location.region,
            location.postalCode || location.zipCode
        ].filter(part => part && typeof part === 'string' && part.trim() !== '');
        
        return parts.length > 0 ? parts.join(', ') : 'Dirección no disponible';
    }

    /**
     * Extrae las descripciones como array que espera el frontend
     */
    extractDescriptionsArray(property) {
        const description = this.extractDescription(property);
        if (!description) return [];
        
        // Si ya es un array, devolverlo
        if (Array.isArray(description)) {
            return description.map(desc => ({
                text: typeof desc === 'string' ? desc : desc.text || desc.description || ''
            }));
        }
        
        // Si es un string, convertirlo a array
        if (typeof description === 'string') {
            return [{ text: description }];
        }
        
        // Si es un objeto, extraer el texto
        if (typeof description === 'object' && description.text) {
            return [{ text: description.text }];
        }
        
        return [];
    }
}

module.exports = IdealistaDataParser;