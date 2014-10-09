__author__ = 'J'

import math
import matplotlib.pyplot as plt

def plot_squashing_functions():

    functions = []

    x = [i*0.002 for i in range(-250, 750)]

    linear = [0 for i in x[:251]]
    [linear.append(i) for i in x[251:751]]
    [linear.append(1) for i in x[751:]]

    inverted_linear = [1 for i in x[:251]]
    [inverted_linear.append(-i + 1) for i in x[251:751]]
    [inverted_linear.append(0) for i in x[751:]]

    exponential = [0 for i in x[:251]]
    [exponential.append((math.exp(i) - 1.0)/(math.exp(1) - 1.0)) for i in x[251:751]]
    [exponential.append(1) for i in x[751:]]

    inverted_exponential = [1 for i in x[:251]]
    [inverted_exponential.append(-(math.exp(i) - 1.0)/(math.exp(1) - 1.0) + 1) for i in x[251:751]]
    [inverted_exponential.append(0) for i in x[751:]]

    log = [0 for i in x[:251]]
    [log.append((math.log(i + 1.0))/(math.log(2))) for i in x[251:751]]
    [log.append(1) for i in x[751:]]

    inverted_log = [1 for i in x[:251]]
    [inverted_log.append(-(math.log(i + 1.0))/(math.log(2)) + 1) for i in x[251:751]]
    [inverted_log.append(0) for i in x[751:]]

    plt_y_min = -0.1
    plt_y_max = 1.1

    plt.figure()
    plt.ylim([plt_y_min, plt_y_max])
    plt.xlim([-0.5, 1.5])
    plt.plot(x, linear, label='linear')
    plt.vlines(0, plt_y_min, plt_y_max, colors='r', label='Threshold')
    plt.vlines(1, plt_y_min, plt_y_max, colors='g', label='Objective')
    plt.legend(loc=0)
    plt.savefig('linear.svg')
    plt.close()

    plt.figure()
    plt.ylim([plt_y_min, plt_y_max])
    plt.xlim([-0.5, 1.5])
    plt.plot(x, exponential, label='exp')
    plt.vlines(0, plt_y_min, plt_y_max, colors='r', label='Threshold')
    plt.vlines(1, plt_y_min, plt_y_max, colors='g', label='Objective')
    plt.legend(loc=0)
    plt.savefig('exp.svg')
    plt.close()

    plt.figure()
    plt.ylim([-0.1, 1.1])
    plt.xlim([-0.5, 1.5])
    plt.plot(x, log, label='log')
    plt.vlines(0, plt_y_min, plt_y_max, colors='r', label='Threshold')
    plt.vlines(1, plt_y_min, plt_y_max, colors='g', label='Objective')
    plt.legend(loc=0)
    plt.savefig('log.svg')
    plt.close()

    plt.figure()
    plt.ylim([-0.1, 1.1])
    plt.xlim([-0.5, 1.5])
    plt.plot(x, inverted_linear, label='neg linear')
    plt.vlines(0, plt_y_min, plt_y_max, colors='g', label='Objective')
    plt.vlines(1, plt_y_min, plt_y_max, colors='r', label='Threshold')
    plt.legend(loc=0)
    plt.savefig('neg_linear.svg')
    plt.close()

    plt.figure()
    plt.ylim([plt_y_min, plt_y_max])
    plt.xlim([-0.5, 1.5])
    plt.plot(x, inverted_exponential, label='neg exp')
    plt.vlines(0, plt_y_min, plt_y_max, colors='g', label='Objective')
    plt.vlines(1, plt_y_min, plt_y_max, colors='r', label='Threshold')
    plt.legend(loc=0)
    plt.savefig('neg_exp.svg')
    plt.close()

    plt.figure()
    plt.ylim([-0.1, 1.1])
    plt.xlim([-0.5, 1.5])
    plt.plot(x, inverted_log, label='neg log')
    plt.vlines(0, plt_y_min, plt_y_max, colors='g', label='Objective')
    plt.vlines(1, plt_y_min, plt_y_max, colors='r', label='Threshold')
    plt.legend(loc=0)
    plt.savefig('neg_log.svg')
    plt.close()


if __name__ == "__main__":
    plot_squashing_functions()