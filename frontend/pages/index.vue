<template>
  <div>
    <div class="text-center py-12">
      <h1 class="text-5xl font-bold text-gray-800 mb-4">
        Добро пожаловать в Tourist Shop
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Лучшая туристическая одежда для ваших приключений
      </p>
      <NuxtLink
        to="/products"
        class="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-600"
      >
        Перейти к каталогу
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-2">Качество</h3>
        <p class="text-gray-600">
          Только проверенные бренды и качественные материалы
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-2">Доставка</h3>
        <p class="text-gray-600">
          Быстрая доставка по всей стране
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-2">Гарантия</h3>
        <p class="text-gray-600">
          Гарантия качества на всю продукцию
        </p>
      </div>
    </div>
  </div>
</template>

