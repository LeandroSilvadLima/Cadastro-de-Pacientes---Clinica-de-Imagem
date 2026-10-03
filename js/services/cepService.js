/**
 * Serviço de busca de endereço por CEP utilizando a API ViaCEP
 */

export async function fetchAddressByCEP(cep) {
    const cleanCEP = cep.replace(/\D/g, '');

    if (cleanCEP.length !== 8) {
        throw new Error('CEP deve conter 8 dígitos numéricos.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Falha ao comunicar com o serviço de CEP.');
        }

        const data = await response.json();

        if (data.erro) {
            throw new Error('CEP não encontrado na base dos Correios.');
        }

        return {
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
        };
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Tempo de requisição esgotado ao buscar o CEP.');
        }
        throw err;
    }
}
