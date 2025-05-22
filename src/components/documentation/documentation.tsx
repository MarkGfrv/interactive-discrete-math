import React from 'react';
import gif1 from './gifs/video1.gif';
import gif2 from './gifs/video2.gif';
import gif3 from './gifs/video3.gif';
import gif4 from './gifs/video4.gif';
import gif5 from './gifs/video5.gif';
import gif6 from './gifs/video6.gif';
import gif7 from './gifs/video7.gif';
import gif8 from './gifs/video8.gif';
import gif9 from './gifs/video9.gif';

export default function DiscreteMathLearningSystemDoc() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">
        Документация к интеллектуальной обучающей системе по дискретной математике
      </h1>
      <section>
        <h2 className="text-3xl font-semibold">
          Интеграция с SC-сервером
        </h2>
        <p className="mt-2">
          Интеллектуальная система взаимодействует с SC-сервером путём использования реализации SC-клиента для TypeScript.
          Данный клиент находится в общем доступе по ссылке:{' '}
          <a
            href="https://github.com/ostis-ai/ts-sc-client"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/ostis-ai/ts-sc-client
          </a>
        </p>
      </section>
      <section>
        <h2 className="text-3xl font-semibold">
          Теоретические сведения
        </h2>
        <p className="mt-2">
          Обучающая составляющая интеллектуальной системы представляет собой структурированную иерархию разделов
          с теоретическими сведениями в текстовом и мультимедийном формате. После изучения теории пользователь может
          закрепить уровень своих знаний, пройдя небольшой тест.
        </p>

        <ul className="list-disc list-inside space-y-4 mt-4">
          <li>
            <h3 className="text-2xl font-medium">
              Просмотр теоретических сведений в текстовом формате
            </h3>
            <p className="mt-1">
              Теоретические сведения для разделов теории графов представлены HTML-страницами, которые система получает из
              базы знаний на базе Платформы OSTIS.
            </p>
            <img 
              src={gif1}
              alt="Просмотр теоретических сведений в текстовом формате"
              className="w-full h-auto rounded-lg shadow mb-4"
            />
          </li>
          <li>
            <h3 className="text-2xl font-medium">
              Просмотр теоретических сведений в мультимедийном формате
            </h3>
            <p className="mt-1">
              На странице доступна кнопка просмотра видео, где информация из теории представлена в визуальном формате
              для лучшего усвоения.
            </p>
            <img 
              src={gif2}
              alt="Просмотр теоретических сведений в мультимедийном формате"
              className="w-full h-auto rounded-lg shadow mb-4"
            />
          </li>
          <li>
            <h3 className="text-2xl font-medium">
              Тестирование полученных знаний
            </h3>
            <p className="mt-1">
              После изучения материала пользователь может пройти тест из нескольких заданий с вариантами ответа. Для ответа на такие вопросы пользователь должен внимательно изучить текстовый материал, 
              а также посмотреть видеоконтент, вопросы теста составлены по комбинированной информации с данных источников.
            </p>
            <img 
              src={gif3}
              alt="Тестирование знаний по определённому разделу"
              className="w-full h-auto rounded-lg shadow mb-4"
            />
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-3xl font-semibold">
          Пространства
        </h2>
        <p className="mt-2">
          На момент входа в систему доступно одно рабочее пространство и возможность добавления новых пространств. Пространства представляют собой графовые редакторы, разработанные с поддержкой SCg. Функционал пространств включает в себя возможности рисования графовых структур, их инициализации, редактирования, а также решения различных задач, как задачи классификации, поиск числа вершин, объединение и пересечение графов.
        </p>
        <ul className="list-disc list-inside space-y-3 mt-4">
          <li>
            <h3 className="text-2xl font-medium">Редактор графов</h3>
             <p className="mt-1">
              Графовые редакторы позволяют пользователю создавать и инициализировать графовые структуры. Функционал редакторов поддерживает 9 различных типов sc-узлов и 3 типа sc-дуг.
            </p>
            <img 
              src={gif4}
              alt="Создание графа"
              className="w-full h-auto rounded-lg shadow mb-4"
            />
          </li>
          <li>
            <h3 className="text-2xl font-medium">Задачи классификации</h3>
            <p className="mt-1">
              Классификация - часть функционала системы, которая позволяет определить принадлежность или непринадлежность графовой структуры к тому или иному классу. Доступна классификация по признаку ориентированности.
            </p>
            <img 
              src={gif6}
              alt="Проверка графа на ориентированность с положительным результатом"
              className="w-full h-auto rounded-lg shadow mb-4"
            />
            <img 
              src={gif7}
              alt="Проверка графа на ориентированность с отрицательным результатом"
              className="w-full h-auto rounded-lg shadow mb-4"
            />
          </li>
          <li>
            <h3 className="text-2xl font-medium">Числовые характеристики</h3>
            <p className="mt-1">
              Пространства обладают возможностью вычисления числовых характеристик графовых структур - это может быть, например, число вершин для графа или мощность для множества.
            </p>
            <img 
              src={gif5}
              alt="Вычисление количества вершин графа"
              className="w-full h-auto rounded-lg shadow mb-4"
            />
          </li>
          <li>
            <h3 className="text-2xl font-medium">Операции над графами</h3>
            <p className="mt-1">
              Функционал системы также позволяет реализовывать некоторые операции над парой графовых структур, а именно объединение и пересечение. Операция объединения создаёт в окне рабочего пространства новую структуру, являющуюся объединением выбранных графовых структур, пересечение - структуру, соответственно являющуюся пересечением графов.
            </p>
            <img 
              src={gif8}
              alt="Объединение графов"
              className="w-full h-auto rounded-lg shadow mb-4"
            />
            <img 
              src={gif9}
              alt="Пересечение графов"
              className="w-full h-auto rounded-lg shadow mb-4"
            />
          </li>
        </ul>
      </section>
    </div>
  );
}


